import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from "https://esm.sh/@solana/web3.js@1.95.8";
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from "https://esm.sh/@solana/spl-token@0.4.11";
import bs58 from "https://esm.sh/bs58@6.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Quiz ID to JIET reward mapping (in JIET tokens)
const QUIZ_REWARDS: Record<number, number> = {
  1: 10,   // Blockchain Basics - 10 JIET
  2: 15,   // Cryptocurrency Fundamentals - 15 JIET
  3: 20,   // Smart Contracts - 20 JIET
  4: 25,   // DeFi Protocols - 25 JIET
  5: 30,   // NFT & Web3 - 30 JIET
  6: 35,   // Crypto Security - 35 JIET
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const privateKeyBase58 = Deno.env.get('SOLANA_WALLET_PRIVATE_KEY')!;

    // Replace with your actual JIET token mint address
    const JIET_TOKEN_MINT = "yuviMjXsZG6HLanQWForF9Dz7JVfmvgpNjqQUtDaYBJ";

    if (!privateKeyBase58) {
      throw new Error('SOLANA_WALLET_PRIVATE_KEY not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { quizId, score, walletAddress } = await req.json();

    console.log('Processing reward:', { userId: user.id, quizId, score, walletAddress });

    if (!quizId || score === undefined || !walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already received reward for this quiz
    const { data: existingCompletion } = await supabase
      .from('quiz_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('quiz_id', quizId)
      .maybeSingle();

    if (existingCompletion?.jiet_rewarded) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'You have already received rewards for this quiz',
          alreadyRewarded: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate JIET reward based on quiz
    const jietAmount = QUIZ_REWARDS[quizId] || 10;

    console.log('Initiating JIET transfer:', { amount: jietAmount, to: walletAddress });

    // Initialize Solana connection (using devnet, change to mainnet-beta for production)
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // Decode private key
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    const senderKeypair = Keypair.fromSecretKey(privateKeyBytes);

    // Get token accounts
    const mintPublicKey = new PublicKey(JIET_TOKEN_MINT);
    const recipientPublicKey = new PublicKey(walletAddress);

    const senderTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      senderKeypair.publicKey
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      recipientPublicKey
    );

    // Convert JIET amount to smallest unit (assuming 6 decimals)
    const amount = BigInt(Math.floor(jietAmount * 1_000_000));

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderKeypair.publicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID
    );

    // Create and send transaction
    const transaction = new Transaction().add(transferInstruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;

    // Sign and send transaction
    transaction.sign(senderKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    
    console.log('Transaction sent:', signature);

    // Confirm transaction
    await connection.confirmTransaction(signature);

    console.log('Transaction confirmed:', signature);

    // Record completion in database
    const completionData = {
      user_id: user.id,
      quiz_id: quizId,
      score: score,
      jiet_rewarded: true,
      jiet_amount: jietAmount,
      wallet_address: walletAddress,
      transaction_signature: signature,
    };

    if (existingCompletion) {
      await supabase
        .from('quiz_completions')
        .update(completionData)
        .eq('id', existingCompletion.id);
    } else {
      await supabase
        .from('quiz_completions')
        .insert(completionData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        jietAmount,
        transactionSignature: signature,
        message: `${jietAmount} JIET tokens sent to your wallet!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing reward:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
