import Link from "next/link";
import { 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  FileSpreadsheet, 
  Stamp, 
  Lock,
  Sparkles,
  Zap
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LiveSpecimenCarousel from "@/components/LiveSpecimenCarousel";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    if ((session.user as any).role === "member") {
      redirect("/portal");
    } else {
      redirect("/dashboard");
    }
  }

  const sampleCertificateId = "cmtzoowrv0008585767kqhhyk";

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      {/* Modern Hero Section */}
      <main className="flex-1 relative overflow-y-auto bg-[#0a0a0a] text-zinc-100">
        
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 relative z-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Hero Content */}
            <div className="flex flex-col gap-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-zinc-50 leading-tight">
                Beautiful<br/>
                Certificates.<br/>
                Verified.
              </h1>

              <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">
                Stop manually generating PDFs. shim automates stunning, QR-secured credentials for your webinars, summits, and hackathons in minutes.
              </p>

              {/* Action Bar - Multi-domain CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/login" className="bg-zinc-100 hover:bg-white text-zinc-800 font-medium rounded-md py-3 px-8 transition-colors flex items-center justify-center gap-2 w-fit">
                  Get Started
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right Hero Visuals */}
            <div className="relative">
              <div className="p-8 bg-zinc-800/50 border border-zinc-800 rounded-xl relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-zinc-400 animate-pulse rounded-full" />
                    <span className="text-sm font-medium text-zinc-400">Live Preview</span>
                  </div>
                </div>

                <div className="pointer-events-none bg-white p-2 border border-zinc-200 rounded shadow-xl">
                  <LiveSpecimenCarousel />
                </div>
              </div>
            </div>
          </div>
        </section>


      </main>
    </div>
  );
}
