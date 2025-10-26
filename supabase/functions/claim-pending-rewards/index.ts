import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Connection, Keypair, PublicKey, Transaction } from "https://esm.sh/@solana/web3.js@1.95.8";
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from "https://esm.sh/@solana/spl-token@0.4.11";
import bs58 from "https://esm.sh/bs58@6.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JIET_TOKEN_MINT = "mntS6ZetAcdw5dLFFtLw3UEX3BZW5RkDPamSpEmpSbP";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const privateKeyBase58 = Deno.env.get('SOLANA_WALLET_PRIVATE_KEY')!;
    if (!privateKeyBase58) throw new Error('Server not configured');

    // Get user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Unauthorized');
    
    const { walletAddress } = await req.json();
    if (!walletAddress) throw new Error('Wallet address required');

    // 1. Find all unclaimed rewards
    const { data: unclaimed, error: selectError } = await supabase
      .from('quiz_completions')
      .select('id, jiet_amount')
      .eq('user_id', user.id)
      .eq('jiet_rewarded', false)
      .gt('jiet_amount', 0); // Only get rows where reward is > 0

    if (selectError) throw selectError;
    if (!unclaimed || unclaimed.length === 0) {
      return new Response(JSON.stringify({ success: true, totalClaimed: 0, message: "No pending rewards found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // 2. Calculate total
    const totalToClaim = unclaimed.reduce((sum, r) => sum + Number(r.jiet_amount), 0);
    const completionIds = unclaimed.map(r => r.id);
    
    if (totalToClaim <= 0) {
      return new Response(JSON.stringify({ success: true, totalClaimed: 0, message: "No amount to claim" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Send one transaction
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const senderKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
    const mintPublicKey = new PublicKey(JIET_TOKEN_MINT);
    const recipientPublicKey = new PublicKey(walletAddress);

    const senderTokenAccount = await getAssociatedTokenAddress(mintPublicKey, senderKeypair.publicKey);
    const recipientTokenAccount = await getAssociatedTokenAddress(mintPublicKey, recipientPublicKey);

    // Assuming 6 decimals
    const amount = BigInt(Math.floor(totalToClaim * 1_000_000));

    const transaction = new Transaction().add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderKeypair.publicKey,
        amount,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;
    
    const signature = await connection.sendTransaction(transaction, [senderKeypair]);
    await connection.confirmTransaction(signature);

    // 4. Mark all as claimed
    await supabase
      .from('quiz_completions')
      .update({ jiet_rewarded: true, wallet_address: walletAddress, transaction_signature: signature })
      .in('id', completionIds);

    return new Response(JSON.stringify({ 
      success: true, 
      totalClaimed: totalToClaim, 
      signature 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error claiming rewards:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});