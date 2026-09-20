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
      <main className="flex-1 relative overflow-hidden bg-[#0a0a0a] text-zinc-100">
        
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 relative z-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Hero Content */}
            <div className="flex flex-col gap-8">
              <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 mb-2">
                <Sparkles size={14} className="text-zinc-400" />
                <span>Introducing SHIM Multi-Tenant Architecture</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600 leading-[1.1]">
                Beautiful<br/>
                Certificates.<br/>
                Verified.
              </h1>

              <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">
                Stop manually generating PDFs. shim automates stunning, QR-secured credentials for your webinars, summits, and hackathons in minutes.
              </p>

              {/* Action Bar - Multi-domain CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <a href="https://shim-studio.vercel.app/register" className="group bg-white text-zinc-950 font-medium rounded-full py-3.5 px-8 transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
                  Organizer Login
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="https://shim-wallet.vercel.app/login" className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-full py-3.5 px-8 transition-all duration-300 hover:scale-105 active:scale-95 hover:text-white hover:border-zinc-700 flex items-center justify-center gap-2">
                  Participant Wallet
                </a>
              </div>
            </div>

            {/* Right Hero Visuals */}
            <div className="relative">
              <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-xl relative group">
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

        {/* Feature Grid */}
        <section className="bg-[#0a0a0a] py-24 border-t border-zinc-900 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-zinc-50 mb-4">Everything You Need<br/>To Issue At Scale</h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">From intimate seminars to global conventions, our infrastructure handles your certification needs effortlessly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: BookOpen, title: "Visual Designer", desc: "Drag & drop builder to design stunning certificates that match your event's branding." },
                { icon: Stamp, title: "Multi-Role Support", desc: "Instantly segment and issue different designs for Speakers, Attendees, and Sponsors." },
                { icon: FileSpreadsheet, title: "Bulk Generation", desc: "Upload a CSV and generate thousands of personalized certificates in seconds." },
                { icon: ShieldCheck, title: "One-Click Verify", desc: "Embedded QR codes allow anyone to instantly verify a credential's authenticity." }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.05)] group">
                  <div className={`w-14 h-14 flex items-center justify-center mb-6 rounded-full bg-zinc-800 text-zinc-300 group-hover:bg-white group-hover:text-zinc-900 transition-colors shadow-inner`}>
                    <feature.icon size={26} />
                  </div>
                  <h3 className="font-semibold text-zinc-100 text-xl mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-[#0a0a0a] relative overflow-hidden border-t border-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-block mb-6 border border-zinc-800 bg-zinc-900/50 rounded-full px-4 py-1.5 shadow-lg">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                <Sparkles size={14} className="text-white" /> Ready to upgrade?
              </span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 mb-6">
              Stop Wasting Time<br/>On Manual PDFs.
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
              Join hundreds of modern event organizers using shim to streamline their post-event credentialing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="https://shim-studio.vercel.app/register" className="group bg-white text-zinc-950 font-medium py-4 px-10 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-zinc-100 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center gap-2 w-full sm:w-auto justify-center">
                Get Started For Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
