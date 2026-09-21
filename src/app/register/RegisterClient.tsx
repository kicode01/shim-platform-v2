"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Mail, Key, User, ShieldAlert, ArrowLeft, Eye, EyeOff, Loader2, Sparkles, Zap, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("organizer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to register account.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred.");
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
              Stop sending unverified PDFs.
            </h1>
            <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
              Give your participants credentials they can be proud of, backed by immutable audit logs and instant QR verification.
            </p>

            <div className="flex flex-col gap-5">
              {[
                "Visual template designer",
                "1-click batch generation",
                "Public verification portal",
                "Role-based multi-credential support"
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
                  <h2 className="text-2xl font-bold text-zinc-800 mb-1">Create Account</h2>
                  <p className="text-sm font-medium text-zinc-500 mb-4">Join the standard in digital credentials.</p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 mb-6 text-sm bg-red-50 text-red-600 rounded-md">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Name or Organization</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="text" 
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-md px-3 py-2.5 pl-10 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-400 text-sm" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe / Tech Corp"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="email" 
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-md px-3 py-2.5 pl-10 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-400 text-sm" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@shim.app"
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
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-md px-3 py-2.5 pl-10 pr-10 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-400 text-sm" 
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

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">I want to...</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`border rounded-lg p-3 cursor-pointer flex flex-col transition-all ${role === "organizer" ? "bg-zinc-50 border-zinc-800 ring-1 ring-zinc-800" : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
                        <input type="radio" name="role" value="organizer" className="sr-only" checked={role === "organizer"} onChange={() => setRole("organizer")} />
                        <div className="flex-1 flex flex-col justify-start">
                          <span className="text-sm font-semibold text-zinc-800 mb-1 leading-tight">Host Events</span>
                          <span className="text-xs text-zinc-500 leading-snug">I am an organizer.</span>
                        </div>
                      </label>
                      <label className={`border rounded-lg p-3 cursor-pointer flex flex-col transition-all ${role === "member" ? "bg-zinc-50 border-zinc-800 ring-1 ring-zinc-800" : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
                        <input type="radio" name="role" value="member" className="sr-only" checked={role === "member"} onChange={() => setRole("member")} />
                        <div className="flex-1 flex flex-col justify-start">
                          <span className="text-sm font-semibold text-zinc-800 mb-1 leading-tight">Earn Credentials</span>
                          <span className="text-xs text-zinc-500 leading-snug">I am an attendee.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-zinc-800 text-white hover:bg-zinc-800 font-medium rounded-md py-2.5 mt-4 transition-colors flex items-center justify-center gap-2 text-sm"
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    <span>{loading ? "Creating..." : "Create Account"}</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="text-center mt-6 text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="text-zinc-800 font-medium hover:underline ml-1">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
