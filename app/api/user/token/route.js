import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(req) {
  try {
    // 1. Authenticate the user session via Clerk
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Fetch user's email address from Clerk details
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "no-email@flowsense.ai";

    // 3. Generate a secure, unique Personal Access Token (PAT)
    const rawToken = `fs_pat_live_${crypto.randomBytes(16).toString("hex")}`;
    
    // 4. Hash the token using SHA-256 before writing to PostgreSQL (security best practice)
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 5. Upsert user in PostgreSQL (create if new visitor, update token if existing)
    await db.user.upsert({
      where: { clerkId: userId },
      update: { token: hashedToken },
      create: {
        clerkId: userId,
        email: email,
        token: hashedToken,
      },
    });

    // 6. Return the plaintext token ONLY ONCE to the user
    return new Response(JSON.stringify({ token: rawToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
