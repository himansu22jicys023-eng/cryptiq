import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Connection, Keypair, PublicKey, Transaction } from "https://esm.sh/@solana/web3.js@1.95.8";
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from "https://esm.sh/@solana/spl-token@0.4.11";
import bs58 from "https://esm.sh/bs58@6.0.0";

const ALLOWED_ORIGIN = "https://cryptiq-ten.vercel.app"; // ✅ your frontend URL

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JIET_TOKEN_MINT = "mntS6ZetAcdw5dLFFtLw3UEX3BZW5RkDPamSpEmpSbP";

serve(async (req) => {
  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const privateKeyBase58 = Deno.env.get("SOLANA_WALLET_PRIVATE_KEY")!;
    if (!privateKeyBase58) throw new Error("Missing SOLANA_WALLET_PRIVATE_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    // ✅ Parse input
    const { quizId, score, walletAddress } = await req.json();
    if (!quizId || score === undefined || !walletAddress) {
      throw new Error("Missing required fields: quizId, score, walletAddress");
    }

    // ✅ Check if already rewarded
    const { data: existingCompletion } = await supabase
      .from("quiz_completions")
      .select("*")
      .eq("user_id", user.id)
      .eq("quiz_id", quizId)
      .maybeSingle();

    if (existingCompletion?.jiet_rewarded) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Already rewarded for this quiz.",
          alreadyRewarded: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ Get quiz reward
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("jiet_reward")
      .eq("id", quizId)
      .single();

    if (quizError || !quizData) throw new Error("Quiz not found.");
    const jietAmount = Number(quizData.jiet_reward);
    if (jietAmount <= 0) throw new Error("No reward assigned for this quiz.");

    // ✅ Solana setup
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const senderKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
    const mintPublicKey = new PublicKey(JIET_TOKEN_MINT);
    const recipientPublicKey = new PublicKey(walletAddress);

    const senderTokenAccount = await getAssociatedTokenAddress(mintPublicKey, senderKeypair.publicKey);
    const recipientTokenAccount = await getAssociatedTokenAddress(mintPublicKey, recipientPublicKey);

    const amount = BigInt(Math.floor(jietAmount * 1_000_000)); // 6 decimals

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

    // ✅ Save reward info
    const completionData = {
      user_id: user.id,
      quiz_id: quizId,
      score,
      jiet_rewarded: true,
      jiet_amount: jietAmount,
      wallet_address: walletAddress,
      transaction_signature: signature,
    };

    if (existingCompletion) {
      await supabase.from("quiz_completions").update(completionData).eq("id", existingCompletion.id);
    } else {
      await supabase.from("quiz_completions").insert(completionData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Transferred ${jietAmount} JIET tokens successfully.`,
        signature,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing reward:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
