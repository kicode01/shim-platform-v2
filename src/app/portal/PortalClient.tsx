"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Hash, Calendar, Building2, QrCode, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";

interface Certificate {
  id: string;
  recipientName: string;
  role: string;
  status: string;
  issueDate: string;
  event: { name: string };
  template: { name: string };
}

interface PortalClientProps {
  user: { name: string; membershipId: string };
  certificates: Certificate[];
  stats: {
    totalCertificates: number;
    eventsAttended: number;
    organizations: number;
    verifications: number;
  };
  insights: {
    events: string[];
    organizations: string[];
  };
}

export default function PortalClient({ user, certificates, stats, insights }: PortalClientProps) {
  const [showQR, setShowQR] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex-1 w-full bg-zinc-50 font-sans overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <span className="bg-zinc-900 text-white p-2 rounded-xl">
                <ShieldCheck size={24} />
              </span>
              Digital Wallet
            </h1>
            <p className="text-zinc-500 mt-2">Manage your verified credentials and event certificates.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 leading-none">{user.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Hash size={10} className="text-zinc-400" />
                  <span className="text-[10px] font-mono text-zinc-400 leading-none">{user.membershipId}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 text-sm font-medium bg-zinc-900 text-white px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm h-[42px]"
            >
              <QrCode size={16} />
              <span className="hidden sm:inline">Wallet ID</span>
            </button>
          </div>
        </div>

        {/* Wallet Stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {[
            { label: "Total Credentials", value: stats.totalCertificates, color: "text-zinc-900" },
            { label: "Verified Claims", value: stats.verifications, color: "text-emerald-600" },
            { label: "Events Attended", value: stats.eventsAttended, color: "text-zinc-900" },
            { label: "Issuers", value: stats.organizations, color: "text-zinc-900" },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <p className={`text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
              <p className="text-sm font-medium text-zinc-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Credentials Section - Wallet Cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
              My Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real credentials */}
            {certificates.map((cert, i) => (
              <motion.div
                key={cert.id}
                className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border border-zinc-700/50 rounded-2xl p-6 flex flex-col gap-6 shadow-xl overflow-hidden group"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 * i }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                      {cert.template.name}
                    </span>
                    <h3 className="text-xl font-bold mt-4 leading-tight">{cert.role}</h3>
                    <p className="text-zinc-300 font-medium mt-1">{cert.event.name}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-inner shrink-0">
                    <QrCode size={40} className="text-zinc-900" />
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                  <div>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Issued</p>
                    <p className="text-sm font-semibold">{new Date(cert.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <Link href={`/validate?id=${cert.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl text-sm font-bold transition-colors">
                    <ExternalLink size={14} /> Open
                  </Link>
                </div>
              </motion.div>
            ))}

            {/* Hardcoded sample certificate */}
            {certificates.length === 0 && (
              <div className="relative bg-gradient-to-br from-emerald-900 to-emerald-800 text-white border border-emerald-700/50 rounded-2xl p-6 flex flex-col gap-6 shadow-xl overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                      Sample Credential
                    </span>
                    <h3 className="text-xl font-bold mt-4 leading-tight">Participant</h3>
                    <p className="text-emerald-100 font-medium mt-1">Intro to Web Development</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-inner shrink-0 opacity-50">
                    <QrCode size={40} className="text-emerald-900" />
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                  <div>
                    <p className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Issued</p>
                    <p className="text-sm font-semibold">Sep 15, 2025</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700/50 text-white rounded-xl text-sm font-bold cursor-not-allowed">
                    <ShieldCheck size={14} /> Verified
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {isMounted && showQR ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowQR(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden transform transition-all duration-300"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <h3 className="font-semibold text-zinc-700">My QR Code</h3>
                <button onClick={() => setShowQR(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 mb-6">
                  <QRCodeSVG 
                    value={user.membershipId} 
                    size={200}
                    level="H"
                    includeMargin={false}
                    fgColor="#09090b"
                  />
                </div>
                <p className="text-sm text-zinc-500 text-center mb-1">
                  Present this code for fast check-in at events.
                </p>
                <p className="font-mono text-zinc-700 font-bold text-lg tracking-wider bg-zinc-100 px-4 py-2 rounded-lg mt-4">
                  #{user.membershipId}
                </p>
              </div>
            </div>
          </div>,
          document.body
        ) : null}

      </div>
    </div>
  );
}
