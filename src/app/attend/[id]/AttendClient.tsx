"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface AttendClientProps {
  event: {
    id: string;
    name: string;
    description: string | null;
    date: string | null;
  };
}

export default function AttendClient({ event }: AttendClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Please fill in both fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/attend/${event.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to check in");
      }

      if (data.certificateId) {
        // Automated issuance: certificate was created
        setCertificateId(data.certificateId);
        // Redirect after a short delay so they see the success message
        setTimeout(() => {
          router.push(`/validate/${data.certificateId}`);
        }, 1500);
      } else {
        // Deferred issuance: just added to attendance list
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-950 overflow-y-auto font-sans">
      {/* Custom Attend Header */}
      <header className="w-full px-6 py-6 flex items-center border-b border-zinc-200 shrink-0">
        <div className="max-w-md w-full mx-auto flex items-center justify-center md:justify-start gap-2">
          <img src="/icon-qr.svg" alt="Shim Logo" className="w-8 h-8 object-contain" />
        </div>
      </header>

      {/* Main Content - Full Bleed */}
      <main className="flex-1 flex flex-col px-6 py-8 md:px-12 md:py-16 w-full max-w-2xl mx-auto">
        
        <div className="text-left mb-12">
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-4">Event Check-In</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 text-zinc-800 leading-none">
            {event.name}
          </h1>
          {event.date && (
            <p className="text-zinc-500 font-medium text-lg">
              {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          {success ? (
            <div className="text-center animate-fade-in py-16 flex flex-col items-center justify-center h-full">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-zinc-800 tracking-tight">Checked In!</h2>
              <p className="text-zinc-500 text-xl md:text-2xl max-w-md mx-auto">
                Your digital certificate will be issued by the organizers soon.
              </p>
            </div>
          ) : certificateId ? (
            <div className="text-center animate-fade-in py-16 flex flex-col items-center justify-center h-full">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-zinc-800 tracking-tight">Certificate Minted!</h2>
              <p className="text-zinc-500 text-xl md:text-2xl max-w-md mx-auto flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-800" /> Redirecting to your vault...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 flex-1 flex flex-col">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border-l-4 border-red-500 font-medium">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent border-b-2 border-zinc-200 focus:border-zinc-800 text-zinc-800 text-xl md:text-2xl py-4 focus:outline-none transition-colors placeholder:text-transparent disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                  <label 
                    htmlFor="name" 
                    className="absolute left-0 top-4 text-zinc-400 text-xl md:text-2xl transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:font-bold peer-focus:text-zinc-800 peer-focus:uppercase peer-focus:tracking-widest peer-valid:-top-3 peer-valid:text-xs peer-valid:font-bold peer-valid:text-zinc-400 peer-valid:uppercase peer-valid:tracking-widest pointer-events-none"
                  >
                    Full Name
                  </label>
                  <p className="text-xs text-zinc-400 mt-2 font-medium">How it should appear on your certificate</p>
                </div>

                <div className="relative group pt-6">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent border-b-2 border-zinc-200 focus:border-zinc-800 text-zinc-800 text-xl md:text-2xl py-4 focus:outline-none transition-colors placeholder:text-transparent disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                  <label 
                    htmlFor="email" 
                    className="absolute left-0 top-10 text-zinc-400 text-xl md:text-2xl transition-all peer-focus:top-3 peer-focus:text-xs peer-focus:font-bold peer-focus:text-zinc-800 peer-focus:uppercase peer-focus:tracking-widest peer-valid:top-3 peer-valid:text-xs peer-valid:font-bold peer-valid:text-zinc-400 peer-valid:uppercase peer-valid:tracking-widest pointer-events-none"
                  >
                    Email Address
                  </label>
                </div>
              </div>

              <div className="mt-auto pt-12">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-zinc-800 text-white font-bold text-lg rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Checking in...
                    </>
                  ) : (
                    "Complete Check-in"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-12 text-center text-sm font-medium text-zinc-400">
          <p>Powered by <Link href="/" className="text-zinc-800 hover:text-black transition-colors font-bold">shim</Link></p>
        </div>
      </main>
    </div>
  );
}
