import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Create a 60-second token
    const token = await encode({
      token: { 
        userId: userId, 
        purpose: "handoff"
      },
      secret: process.env.NEXTAUTH_SECRET || "super-secret-nextauth-token-12345",
      salt: "shim-handoff-token-salt",
      maxAge: 60
    });

    const isLocal = req.url.includes("localhost") || req.headers.get("host")?.includes("localhost");
    
    // Determine target domain based on role
    const targetDomain = role === "member" 
      ? (isLocal ? "http://localhost:3000" : "https://shim-wallet.vercel.app") 
      : (isLocal ? "http://localhost:3000" : "https://shim-studio.vercel.app");

    return NextResponse.json({ 
      url: `${targetDomain}/login?handoff=${token}` 
    });
  } catch (error) {
    console.error("Handoff generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
