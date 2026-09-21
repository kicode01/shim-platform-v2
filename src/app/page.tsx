import Link from "next/link";
import { 
  ArrowRight, 
  Layout, 
  Users, 
  Upload, 
  CheckCircle,
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

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      {/* Modern Hero Section */}
      <main className="flex-1 relative overflow-y-auto bg-[#0a0a0a] text-zinc-100">
        
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-24 relative z-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Hero Content */}
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl lg:text-5xl font-semibold text-zinc-50 leading-tight tracking-tight">
                Verifiable credentials <br className="hidden lg:block"/> for modern events.
              </h1>

              <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">
                Design and issue digital certificates in seconds. Backed by cryptographic verification, built for organizers who care about the details.
              </p>

              {/* Action Bar - Multi-domain CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/login" className="bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-medium rounded-md py-3 px-6 transition-colors flex items-center justify-center gap-2 w-fit">
                  Start issuing
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Hero Visuals */}
            <div className="relative">
              <div className="p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-xl relative group">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-zinc-500 animate-pulse rounded-full" />
                    <span className="text-sm font-medium text-zinc-500">Live Preview</span>
                  </div>
                </div>

                <div className="pointer-events-none bg-white p-2 border border-zinc-200 rounded shadow-2xl">
                  <LiveSpecimenCarousel />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-[#0a0a0a] py-32 border-t border-zinc-900 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20">
              <h2 className="text-3xl font-semibold text-zinc-50 mb-4 tracking-tight">Built for organizers.</h2>
              <p className="text-zinc-400 text-lg max-w-xl">Simple tools to manage credentials, whether it's for ten people or ten thousand.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { icon: Layout, title: "Custom Design", desc: "Build beautiful certificates that match your brand. No design experience required." },
                { icon: Users, title: "Role-based Issuance", desc: "Easily segment attendees, speakers, and sponsors with dynamic templates." },
                { icon: Upload, title: "Bulk Issuance", desc: "Upload your attendee list and issue thousands of credentials instantly." },
                { icon: CheckCircle, title: "Instant Verification", desc: "Every certificate includes a unique QR code for immediate authenticity checks." }
              ].map((feature, idx) => (
                <div key={idx} className="group">
                  <div className={`w-10 h-10 flex items-center justify-center mb-6 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400`}>
                    <feature.icon size={18} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-medium text-zinc-100 text-lg mb-2">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-[#0a0a0a] relative overflow-hidden border-t border-zinc-900">
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl font-semibold text-zinc-50 mb-6 tracking-tight">Issue your first credential today.</h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">Join the organizers using shim to modernize their event experience.</p>
            <div className="flex items-center justify-center">
              <Link href="/register" className="bg-zinc-100 text-zinc-900 text-sm font-medium py-3 px-8 rounded-md hover:bg-white transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
