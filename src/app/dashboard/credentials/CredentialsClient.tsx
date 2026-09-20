"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2,
  Ban,
  Trash2,
  X,
  Loader2,
  BookOpen
} from "lucide-react";

interface CertificateItem {
  id: string;
  recipientName: string;
  recipientEmail?: string | null;
  role?: string | null;
  issueDate: string;
  status: string;
  template?: { id: string; name: string };
  issuer?: { name?: string | null; email?: string | null };
}

export default function CredentialsClient({
  initialCertificates,
}: {
  initialCertificates: CertificateItem[];
}) {
  const [certificates, setCertificates] = useState<CertificateItem[]>(initialCertificates);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`/api/certificates?search=${encodeURIComponent(searchTerm)}&status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (e) {
      console.error("Error refreshing ledger:", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCertificates();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setUpdatingId(id);
    try {
      const newStatus = currentStatus === "valid" ? "revoked" : "valid";
      const res = await fetch(`/api/certificates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setCertificates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        fetchCertificates();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error updating status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setCertificates(prev => prev.filter(c => c.id !== id));
        setConfirmDeleteId(null);
        fetchCertificates();
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to delete credential.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error deleting credential record.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyRef = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-0">
        
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Filter */}
            <div className="flex bg-zinc-100 rounded-lg p-1 w-full sm:w-auto">
              {["all", "valid", "revoked"].map((filter) => (
                <button 
                  key={filter}
                  className={`px-4 py-1.5 text-sm font-medium capitalize rounded-md transition-colors ${
                    statusFilter === filter 
                      ? "bg-white text-zinc-900 shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                  }`}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search recipient..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-zinc-200 text-zinc-900 rounded-md focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-400 text-sm h-auto"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {certificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center overflow-y-auto overflow-x-hidden">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-6">
                <BookOpen size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">No credentials found</h3>
              <p className="text-zinc-500 font-medium max-w-sm mb-8">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter settings." 
                  : "You haven't issued any credentials yet. Issue your first certificate to get started."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-y-scroll overflow-x-hidden invisible-scrollbar bg-zinc-50 border-b border-zinc-200 shrink-0">
                <table className="table-modern w-full table-fixed">
                  <thead>
                    <tr>
                      <th className="w-[28%] px-4 py-3 !border-b-0 text-xs font-medium text-zinc-500 uppercase tracking-wider">Recipient</th>
                      <th className="w-[22%] px-4 py-3 !border-b-0 text-xs font-medium text-zinc-500 uppercase tracking-wider">Role / Template</th>
                      <th className="w-[12%] px-4 py-3 !border-b-0 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                      <th className="w-[15%] px-4 py-3 !border-b-0 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                      <th className="w-[23%] px-4 py-3 text-right !border-b-0 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="overflow-y-scroll overflow-x-hidden flex-1 min-h-0 bg-white">
                <table className="table-modern w-full table-fixed">
                  <tbody className="divide-y divide-zinc-100">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors bg-white">
                    <td className="w-[28%] px-4 py-3 overflow-hidden">
                      <div className="font-medium text-sm text-zinc-900 mb-1 truncate" title={cert.recipientName}>{cert.recipientName}</div>
                      <div className="text-sm text-zinc-500 truncate" title={cert.recipientEmail || "No email"}>{cert.recipientEmail || "No email"}</div>
                    </td>
                    <td className="w-[22%] px-4 py-3 overflow-hidden">
                      <div className="font-medium text-sm text-zinc-900 mb-1 truncate" title={cert.role || "Participant"}>{cert.role || "Participant"}</div>
                      <div className="text-sm text-zinc-500 truncate" title={cert.template?.name || "Standard Template"}>
                        {cert.template?.name || "Standard Template"}
                      </div>
                    </td>
                    <td className="w-[12%] px-4 py-3">
                      <div className="text-sm text-zinc-600">
                        {new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
                      </div>
                    </td>
                    <td className="w-[15%] px-4 py-3">
                      <div className="flex items-center h-full">
                        {cert.status === "valid" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <Ban size={12} /> Revoked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="w-[23%] px-4 py-3 text-right">
                      <div className="flex items-center justify-end h-full">
                        <div className="inline-flex border border-zinc-200 bg-white rounded-md shrink-0 overflow-hidden shadow-sm">
                          {confirmDeleteId === cert.id ? (
                            <div className="flex items-center">
                              <span className="w-14 text-xs font-medium text-red-700 bg-red-50 border-r border-zinc-200 h-8 flex items-center justify-center shrink-0">
                                Sure?
                              </span>
                              <button
                                onClick={() => handleDeleteCertificate(cert.id)}
                                className="w-8 h-8 bg-red-600 text-white hover:bg-red-700 transition-colors border-r border-zinc-200 flex items-center justify-center shrink-0"
                              >
                                {updatingId === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="w-8 h-8 bg-white text-zinc-600 hover:bg-zinc-100 transition-colors flex items-center justify-center shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <button
                                onClick={() => handleCopyRef(cert.id)}
                                className="w-8 h-8 border-r border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors flex items-center justify-center shrink-0"
                                title="Copy cryptographic ref"
                              >
                                {copiedId === cert.id ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                              
                              <Link 
                                href={`/validate?id=${cert.id}`} 
                                target="_blank"
                                className="w-8 h-8 border-r border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors flex items-center justify-center shrink-0"
                                title="Open public view"
                              >
                                <ExternalLink size={14} />
                              </Link>

                              <button
                                onClick={() => handleToggleStatus(cert.id, cert.status)}
                                disabled={updatingId === cert.id}
                                className="w-8 h-8 border-r border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors flex items-center justify-center shrink-0"
                                title={cert.status === "valid" ? "Revoke Credential" : "Restore Credential"}
                              >
                                {updatingId === cert.id ? <Loader2 size={14} className="animate-spin" /> : cert.status === "valid" ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                              </button>

                              <button
                                onClick={() => setConfirmDeleteId(cert.id)}
                                disabled={updatingId === cert.id}
                                className="w-8 h-8 text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center shrink-0"
                                title="Delete permanently"
                              >
                                {updatingId === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Brutalist Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border border-zinc-200 ${
              toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
            } flex items-center gap-3`}
          >
            {toast.type === 'error' ? <X size={20} strokeWidth={2} className="text-red-500" /> : <Check size={20} strokeWidth={2} className="text-emerald-500" />}
            <span className="font-medium text-sm">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
