import { NextResponse } from 'next/server';
import { generateSocialMediaPost } from '@/ai/flows/generate-social-media-post';
import { Connection, PublicKey, TransactionInstruction, ComputeBudgetProgram, VersionedTransaction, TransactionMessage, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export async function POST(req: Request) {
  try {
    // 1. Fetch Top Trend
    const proxyUrl = `https://snowy-wave-66ee.abdallahalshibami.workers.dev/?sub=worldnews&limit=1`;
    const response = await fetch(proxyUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch trends");
    const json = await response.json();
    if (!json || json.length === 0) throw new Error("No trends found");
    const topTrend = json[0].data.title;

    // 2. Generate Content
    const generatedContent = await generateSocialMediaPost({ topic: topTrend, platform: 'Twitter' });

    // 3. Authenticate on Solana
    if (!process.env.AGENT_PRIVATE_KEY) {
      // In a real app we would throw an error, but for this demo, if missing, we auto-generate an ephemeral key
      // so the endpoint doesn't fail immediately, though it has no SOL and will fail simulation.
      throw new Error("AGENT_PRIVATE_KEY not found in environment variables. Please add it to your .env file with a funded Devnet private key.");
    }
    
    let keypair;
    try {
      keypair = Keypair.fromSecretKey(bs58.decode(process.env.AGENT_PRIVATE_KEY));
    } catch {
      throw new Error("Invalid AGENT_PRIVATE_KEY format. Must be a base58 string.");
    }

    const connection = new Connection("https://devnet.helius-rpc.com/?api-key=7cb7dddc-f216-4633-90ff-b4f69c088f42", "confirmed");
    const programId = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

    const encoder = new TextEncoder();
    const data = encoder.encode(generatedContent);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashString = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const instructionData = Buffer.from(`CurioGrid AutoAgent: ${hashString}`, "utf8");
    const instruction = new TransactionInstruction({
      keys: [],
      programId,
      data: instructionData,
    });

    const instructions = [
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
      instruction
    ];

    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    const messageV0 = new TransactionMessage({
      payerKey: keypair.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([keypair]);

    // Send and confirm
    const signature = await connection.sendTransaction(transaction, { skipPreflight: false });
    
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    }, 'confirmed');

    return NextResponse.json({
      success: true,
      trend: topTrend,
      content: generatedContent,
      signature: signature,
      hash: hashString,
      wallet: keypair.publicKey.toBase58()
    });

  } catch (err: any) {
    if (err.message?.includes("Attempt to debit an account")) {
        return NextResponse.json({ success: false, error: "The Server Agent Wallet does not have enough Devnet SOL. Please fund it first." }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
