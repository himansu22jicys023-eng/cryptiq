import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.95.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// !!! IMPORTANT !!!
// Replace with your project's treasury/vault wallet address
const TREASURY_WALLET_ADDRESS = "YOUR_TREASURY_WALLET_PUBLIC_KEY_HERE";
// Replace with your JIET token mint address
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

    // Get user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Unauthorized');

    // Parse request
    const { rewardId, transactionSignature } = await req.json();
    if (!rewardId || !transactionSignature) {
      throw new Error('Missing rewardId or transactionSignature');
    }

    // 1. Get the reward details from DB to know the cost
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('cost')
      .eq('id', rewardId)
      .single();
    if (rewardError || !reward) throw new Error('Reward not found');
    
    const expectedAmount = reward.cost;

    // 2. Verify the Solana transaction
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const tx = await connection.getParsedTransaction(transactionSignature, {
      maxSupportedTransactionVersion: 0
    });
    if (!tx) throw new Error('Transaction not found');

    // 3. Find the token transfer instruction
    const tokenTransfers = tx.meta.innerInstructions
      .flatMap((i) => i.instructions)
      .filter((i) => (i.parsed?.type === 'transfer' && i.program === 'spl-token'));
    
    const transfer = tokenTransfers.find(t => 
      t.parsed.info.destination === TREASURY_WALLET_ADDRESS &&
      t.parsed.info.source === user.walletAddress // !! Assumes user's wallet is stored
      // You might need to pass the user's walletAddress from the client
    );
    
    // A more robust check: find the correct transfer in postTokenBalances
    const preBalance = tx.meta.preTokenBalances.find(b => b.mint === JIET_TOKEN_MINT && b.owner === user.walletAddress);
    const postBalance = tx.meta.postTokenBalances.find(b => b.mint === JIET_TOKEN_MINT && b.owner === user.walletAddress);
    
    const amountTransferred = (preBalance.uiTokenAmount.uiAmount || 0) - (postBalance.uiTokenAmount.uiAmount || 0);

    if (amountTransferred < expectedAmount) {
      throw new Error(`Transaction amount (${amountTransferred}) was less than expected (${expectedAmount})`);
    }

    // 4. Record the redemption in the database
    const { error: insertError } = await supabase
      .from('user_redemptions')
      .insert({
        user_id: user.id,
        reward_id: rewardId,
        cost_paid: expectedAmount,
        transaction_signature: transactionSignature
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, message: 'Reward redeemed successfully!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error redeeming reward:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});