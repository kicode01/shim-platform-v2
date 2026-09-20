"use client";

import { signIn, useSession, getSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Mail, Key, ShieldAlert, ArrowLeft, Eye, EyeOff, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");

  const handoffTriggered = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("handoff");
    if (token && status === "unauthenticated" && !handoffTriggered.current) {
      handoffTriggered.current = true;
      signIn("credentials", {
        redirect: false,
        handoffToken: token,
      }).then(async (res) => {
        if (!res?.error) {
          if (window.location.hostname.includes("shim-wallet")) {
            window.location.href = "/portal";
          } else if (window.location.hostname.includes("shim-studio")) {
            window.location.href = "/dashboard";
          } else {
            const sess = await getSession();
            window.location.href = sess?.user?.role === "member" ? "/portal" : "/dashboard";
          }
        }
      });
    }
  }, [status]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleDemoFill = (role: "admin" | "member") => {
    if (role === "admin") {
      setEmail("admin@shim.app");
      setPassword("admin123");
    } else {
      setEmail("member@shim.app");
      setPassword("member123");
    }
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        if (window.location.hostname.includes("shim-hq")) {
          try {
            const handoffRes = await fetch("/api/auth/handoff");
            if (handoffRes.ok) {
              const data = await handoffRes.json();
              if (data.url) {
                window.location.href = data.url;
                return;
              }
            }
          } catch (e) {
            console.error("Handoff failed", e);
          }
        }
        
        if (window.location.hostname.includes("shim-wallet")) {
          router.push("/portal");
          router.refresh();
          return;
        } else if (window.location.hostname.includes("shim-studio")) {
          router.push("/dashboard");
          router.refresh();
          return;
        }

        const sess = await getSession();
        router.push(sess?.user?.role === "member" ? "/portal" : "/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 relative flex font-sans overflow-hidden bg-[#0a0a0a]">
      {/* Full-bleed Background Split */}
      <div className="absolute inset-0 flex pointer-events-none z-0">
        <motion.div 
          className="w-full lg:w-1/2 bg-white ml-auto"
          initial={{ x: "10%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        ></motion.div>
      </div>

      {/* Constrained Content matching Navbar */}
      <div className="w-full px-4 sm:px-6 flex relative z-10 max-w-7xl mx-auto">
        
        {/* Left Column: Visual Side (Black) */}
        <motion.div 
          className="hidden lg:flex w-1/2 flex-col justify-between py-12 pr-12 lg:py-16 lg:pr-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative z-10 flex flex-col items-start w-full h-10">
            {/* Spacer */}
          </div>

          <div className="relative z-10 w-full max-w-lg my-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-zinc-50 mb-6 leading-tight">
            The standard for modern credentials.
          </h1>
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
            Generate, distribute, and verify thousands of digital certificates in seconds. Secured by cryptographic ledgers.
          </p>

          <div className="flex flex-col gap-5">
            {[
              "Cryptographically secured records",
              "Instant QR-code validation",
              "Bulk data import via JSON/CSV",
              "Tamper-proof audit logs"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-zinc-300 group cursor-default w-fit">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                  <CheckCircle2 size={14} className="stroke-[2.5]" />
                </div>
                <span className="font-medium text-sm group-hover:text-white transition-colors">{feature}</span>
              </div>
            ))}
          </div>
        </div>

          <div className="relative z-10 text-zinc-600 text-sm mt-8">
            &copy; {new Date().getFullYear()} shim Digital Platform
          </div>
        </motion.div>

        {/* Right Column: Form Side (White) */}
        <motion.div 
          className="w-full lg:w-1/2 flex flex-col justify-center items-center py-12 lg:py-16 relative min-h-screen lg:min-h-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Absolute Top Left: Back Link */}
          <div className="absolute top-6 left-6 lg:top-10 lg:left-12 xl:left-16">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>

          {/* Center: Form Box */}
          <div className="w-full max-w-[400px] px-4 sm:px-0">
            <div className="bg-white border border-zinc-200 rounded-xl relative shadow-sm">
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-1">Welcome Back</h2>
                  <p className="text-sm font-medium text-zinc-500 mb-4">Access your organizer dashboard.</p>
                </div>

                {/* Demo Access Cards */}
                <div className="flex flex-col gap-3 mb-6">
                  {/* Organizer Demo */}
                  <div className="border border-zinc-200 rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50 relative z-10 group hover:border-zinc-300 transition-colors">
                    <div>
                      <div className="text-xs font-medium text-zinc-500 mb-1">Organizer Demo</div>
                      <div className="text-sm font-medium text-zinc-900">admin@shim.app</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDemoFill("admin")}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition-colors py-1.5 px-4 text-xs font-medium shrink-0"
                    >
                      Auto-fill
                    </button>
                  </div>

                  {/* Attendee Demo */}
                  <div className="border border-zinc-200 rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50 relative z-10 group hover:border-zinc-300 transition-colors">
                    <div>
                      <div className="text-xs font-medium text-zinc-500 mb-1">Attendee Demo</div>
                      <div className="text-sm font-medium text-zinc-900">member@shim.app</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDemoFill("member")}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition-colors py-1.5 px-4 text-xs font-medium shrink-0"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 mb-6 text-sm bg-red-50 text-red-600 rounded-md">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="email" 
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-md px-3 py-2.5 pl-10 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-400 text-sm" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@shim.app"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-md px-3 py-2.5 pl-10 pr-10 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-400 text-sm" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-zinc-900 text-white hover:bg-zinc-800 font-medium rounded-md py-2.5 mt-4 transition-colors flex items-center justify-center gap-2 text-sm"
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                    <span>{loading ? "Authenticating..." : "Sign In"}</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="text-center mt-6 text-sm text-zinc-500">
                No account?{" "}
                <Link href="/register" className="text-zinc-900 font-medium hover:underline ml-1">
                  Create One
                </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
