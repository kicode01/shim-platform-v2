"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  useEffect(() => {
    // Calling signOut without redirect: false will automatically 
    // clear the NextAuth cookie and redirect to the callbackUrl
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white min-h-screen text-zinc-600">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />
        <span className="text-sm font-medium">Signing you out securely across all domains...</span>
      </div>
    </div>
  );
}
