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

        {/* Profile Row */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-zinc-800">{user.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Hash size={10} className="text-zinc-400" />
                <span className="text-[11px] font-mono text-zinc-400">{user.membershipId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-xs font-medium bg-zinc-100 border border-zinc-200 text-zinc-600 px-3 py-1 rounded-full">
              Active Member
            </span>
            <button 
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 text-xs font-medium bg-zinc-800 text-white px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <QrCode size={12} />
              My QR Code
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {[
            { label: "Certificates", value: stats.totalCertificates, color: "text-zinc-800" },
            { label: "Events Attended", value: stats.eventsAttended, color: "text-zinc-800" },
            { label: "Organizations", value: stats.organizations, color: "text-zinc-800" },
            { label: "Verifications", value: stats.verifications, color: "text-emerald-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-zinc-200 rounded-xl px-4 py-4 text-center shadow-sm">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Insights Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          {/* Organizations List */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-800">Trusted Organizations</h3>
            </div>
            <p className="text-xs text-zinc-500 mb-3">You've interacted with {stats.organizations} {stats.organizations === 1 ? 'organization' : 'organizations'}.</p>
            {insights.organizations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {insights.organizations.map((org, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {org}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">No organizations yet.</p>
            )}
          </div>

          {/* Events List */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-800">Events Attended</h3>
            </div>
            <p className="text-xs text-zinc-500 mb-3">You've attended a total of {stats.eventsAttended} {stats.eventsAttended === 1 ? 'event' : 'events'}.</p>
            {insights.events.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {insights.events.slice(0, 5).map((evt, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-50 text-zinc-600 border border-zinc-200">
                    {evt}
                  </span>
                ))}
                {insights.events.length > 5 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-50 text-zinc-400 border border-zinc-200">
                    +{insights.events.length - 5} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">No events yet.</p>
            )}
          </div>
        </motion.div>

        {/* Certificates Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-zinc-700">Certificates</p>
            {certificates.length > 0 && (
              <span className="text-xs text-zinc-400">{certificates.length} issued</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {/* Real certificates */}
            {certificates.map((cert, i) => (
              <motion.div
                key={cert.id}
                className="bg-white border border-zinc-200 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 hover:border-zinc-300 transition-colors shadow-sm"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 * i }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-white">{cert.role.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{cert.role} Certificate</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {cert.event.name} &middot; {new Date(cert.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cert.status === "valid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-500 border-zinc-200"}`}>
                    {cert.status === "valid" && <ShieldCheck size={11} />}
                    {cert.status === "valid" ? "Verified" : "Revoked"}
                  </span>
                  <Link href={`/validate?id=${cert.id}`} className="inline-flex items-center gap-1 px-2.5 py-1 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 rounded-lg text-[11px] font-medium transition-colors">
                    <ExternalLink size={11} /> View
                  </Link>
                </div>
              </motion.div>
            ))}

            {/* Hardcoded sample certificate (always visible when no real certs) */}
            {certificates.length === 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-white">P</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-zinc-800">Participant Certificate</p>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">Sample</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">Intro to Web Development Workshop &middot; Sep 15, 2025</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Issued by SPPQ Organization</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                    <ShieldCheck size={11} /> Verified
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 border border-zinc-200 bg-zinc-50 text-zinc-400 rounded-lg text-[11px] font-medium cursor-not-allowed select-none">
                    <ExternalLink size={11} /> View
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
                <h3 className="font-semibold text-zinc-800">My QR Code</h3>
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
                <p className="font-mono text-zinc-800 font-bold text-lg tracking-wider bg-zinc-100 px-4 py-2 rounded-lg mt-4">
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
