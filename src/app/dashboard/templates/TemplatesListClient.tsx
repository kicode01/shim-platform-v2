"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Stamp, Edit3, Trash2, FileSpreadsheet, Maximize2, X, Sparkles, Loader2 } from "lucide-react";
import CertificateView, { CertificateDesignConfig } from "@/components/CertificateView";

interface TemplateItem {
  id: string;
  name: string;
  description?: string | null;
  designData: string;
  createdAt: string;
  _count?: { certificates: number };
}

export default function TemplatesListClient({ initialTemplates }: { initialTemplates: TemplateItem[] }) {
  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inspectingTemplate, setInspectingTemplate] = useState<TemplateItem | null>(null);

  const executeDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        setConfirmDeleteId(null);
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Failed to delete template");
      }
    } catch (e) {
      console.error(e);
      setDeleteError("Error deleting template");
    } finally {
      setDeletingId(null);
    }
  };



  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 min-h-0 overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800 mb-1">
            Certificate Templates
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Design and manage visual layouts for your event credentials.
          </p>
        </div>

        <Link href="/dashboard/templates/new" className="flex items-center gap-2 bg-zinc-800 text-white hover:bg-zinc-800 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
          <Plus size={16} />
          <span>New Template</span>
        </Link>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white border border-zinc-200 rounded-xl shadow-sm min-h-0">
          <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-6">
            <Stamp size={28} className="text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800 mb-2">No templates created yet</h2>
          <p className="text-zinc-500 font-medium max-w-md mx-auto mb-8 text-sm">
            Create your first event credential design using our visual builder.
          </p>
          <Link href="/dashboard/templates/new" className="flex items-center gap-2 bg-zinc-800 text-white hover:bg-zinc-800 px-6 py-3 rounded-md font-medium text-sm transition-colors shadow-sm">
            <Plus size={16} />
            <span>Create First Template</span>
          </Link>
        </div>
      ) : (
        <div className="flex-1 overflow-y-scroll overflow-x-hidden min-h-0 pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map(t => {
              let parsedDesign: CertificateDesignConfig = {};
              try {
                parsedDesign = JSON.parse(t.designData);
              } catch (e) {}

              return (
                <div 
                  key={t.id} 
                  className="flex flex-col border border-zinc-200 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Preview Container */}
                  <div 
                    className="bg-zinc-50 p-6 border-b border-zinc-100 relative group cursor-pointer flex items-center justify-center"
                    onClick={() => setInspectingTemplate(t)}
                  >
                    <div className="w-full aspect-[1.414/1] bg-white border border-zinc-200 shadow-sm relative duration-300 group-hover:scale-[1.02] rounded-sm overflow-hidden">
                      <CertificateView 
                        certificateId={`PREVIEW-${t.id.slice(0, 4).toUpperCase()}`}
                        recipientName="Jane Doe"
                        role={t.name}
                        design={parsedDesign}
                      />
                    </div>
                    <div className="absolute inset-0 bg-zinc-800/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                      <span className="bg-white text-zinc-800 text-xs font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                        <Maximize2 size={14} /> Expand Preview
                      </span>
                    </div>
                  </div>

                  {/* Info Block */}
                  <div className="p-5 bg-white flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-zinc-800 leading-tight line-clamp-1">
                        {t.name}
                      </h3>
                      <span className="shrink-0 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                        {t._count?.certificates || 0} Issued
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-2">
                      {t.description || "Custom certificate template layout."}
                    </p>
                  </div>

                  {/* Actions */}
                  {deleteError && confirmDeleteId === t.id && (
                    <div className="px-4 py-2 bg-red-50 text-red-700 text-xs font-medium text-center border-t border-zinc-100">
                      {deleteError}
                    </div>
                  )}
                  <div className="flex border-t border-zinc-100 bg-white divide-x divide-zinc-100">
                    <Link 
                      href={`/dashboard/templates/${t.id}`} 
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
                    >
                      <Edit3 size={16} /> Edit
                    </Link>

                    <Link 
                      href={`/dashboard/generate?templateId=${t.id}`} 
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
                    >
                      <FileSpreadsheet size={16} /> Issue
                    </Link>

                    {confirmDeleteId === t.id ? (
                      <div className="flex-1 flex items-center justify-center gap-2 bg-red-50 p-2">
                        <span className="text-xs font-medium text-red-800">Sure?</span>
                        <button onClick={() => executeDelete(t.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center justify-center min-w-[40px] shadow-sm transition-colors">
                          {deletingId === t.id ? <Loader2 size={12} className="animate-spin" /> : "Yes"}
                        </button>
                        <button onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }} className="bg-white hover:bg-zinc-100 text-zinc-700 px-2 py-1 rounded text-xs font-medium border border-zinc-200 shadow-sm transition-colors">
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setConfirmDeleteId(t.id); setDeleteError(null); }}
                        disabled={deletingId === t.id}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Specimen Inspector Modal */}
      {inspectingTemplate && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300"
          onClick={() => setInspectingTemplate(null)}
        >
          <div 
            className="w-full max-w-4xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start px-6 py-5 border-b border-zinc-100 bg-white shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-zinc-800 mb-1">
                  {inspectingTemplate.name}
                </h2>
                <p className="text-sm text-zinc-500">
                  Previewing custom certificate template
                </p>
              </div>

              <button 
                onClick={() => setInspectingTemplate(null)}
                className="p-2 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* High-Resolution Certificate Render */}
            <div className="p-6 md:p-10 bg-zinc-50 flex-1 overflow-y-auto flex items-center justify-center">
              <div className="w-full max-w-3xl mx-auto aspect-[1.414/1] bg-white rounded shadow-md overflow-hidden relative ring-1 ring-zinc-200 shrink-0">
                <CertificateView 
                  certificateId={`PREVIEW-${inspectingTemplate.id.slice(0, 8).toUpperCase()}`}
                  recipientName="Jane Doe"
                  role={inspectingTemplate.name}
                  design={inspectingTemplate.designData}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
