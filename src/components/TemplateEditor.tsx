"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, Stamp, Sliders, Code2, ShieldCheck, CheckCircle2, RotateCcw, Image as ImageIcon, Move, LayoutTemplate, Loader2, Sparkles, Type, FileImage, MousePointer2, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Database, QrCode, Undo, Redo } from "lucide-react";
import CertificateView, { CertificateDesignConfig, CanvasElement, CanvasElementType } from "@/components/CertificateView";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { PRESETS } from "@/lib/presets";
import { AnimatePresence, motion } from "framer-motion";

interface TemplateEditorProps {
  initialId?: string;
  initialName?: string;
  initialDescription?: string;
  initialDesignData?: string;
  isEdit?: boolean;
}

export default function TemplateEditor({
  initialId,
  initialName = "",
  initialDescription = "",
  initialDesignData,
  isEdit = false,
}: TemplateEditorProps) {
  const router = useRouter();

  const defaultDesign: CertificateDesignConfig = {
    canvasElements: []
  };

  let parsedInitial: CertificateDesignConfig = defaultDesign;
  if (initialDesignData) {
    try {
      parsedInitial = { ...defaultDesign, ...JSON.parse(initialDesignData) };
    } catch (e) {
      console.warn("Could not parse initial design data:", e);
    }
  }

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState('');
  const [dummyQrCode, setDummyQrCode] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL("https://shim-platform.com/verify/PREVIEW", { 
          width: 400, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } 
        });
        setDummyQrCode(dataUrl);
      } catch (err) {
        console.error(err);
      }
    };
    generateQR();
  }, []);

  const [design, setDesign] = useState<CertificateDesignConfig>(parsedInitial);
  const [activeTab, setActiveTab] = useState<"visual" | "builder" | "json">("builder");
  const [jsonText, setJsonText] = useState(JSON.stringify(parsedInitial, null, 2));
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // History state for Undo/Redo
  const [history, setHistory] = useState<CertificateDesignConfig[]>([parsedInitial]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const applyDesignUpdate = (updated: CertificateDesignConfig, pushToHistory: boolean = true) => {
    setDesign(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    if (pushToHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updated);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setDesign(prev);
      setJsonText(JSON.stringify(prev, null, 2));
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setDesign(next);
      setJsonText(JSON.stringify(next, null, 2));
      setHistoryIndex(historyIndex + 1);
    }
  };
  
  // Canvas State
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const updateDesignField = (field: keyof CertificateDesignConfig, value: any) => {
    const updated = { ...design, [field]: value };
    applyDesignUpdate(updated);
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setDesign(parsed); // Only update design, do not re-stringify to avoid cursor jump
      // Optionally, push to history (but typing JSON generates a lot of history)
    } catch (err) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }
    setError('');
    setSaving(true);
    setSavedSuccess(false);
    try {
      const url = isEdit ? `/api/templates/${initialId}` : "/api/templates";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          designData: JSON.stringify(design),
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/templates");
          router.refresh();
        }, 800);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save template.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving template.");
    } finally {
      setSaving(false);
    }
  };

  // --- CANVAS ACTIONS ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const updated = { ...design, backgroundImageUrl: base64 };
      if (!updated.canvasElements) updated.canvasElements = [];
      applyDesignUpdate(updated);
    };
    reader.readAsDataURL(file);
  };

  const addElement = (type: CanvasElementType, defaultText: string = "New Text") => {
    const newEl: CanvasElement = {
      id: uuidv4(),
      type,
      x: 830,
      y: 1000,
      width: (type === 'qrCode' || type === 'image' || type === 'badge') ? 368 : type === 'signature' ? 920 : 1840,
      height: (type === 'qrCode' || type === 'image' || type === 'badge') ? 368 : type === 'shape' ? 20 : type === 'signature' ? 260 : undefined,
      text: type.includes("Text") || type === 'signature' ? defaultText : undefined,
      fontSize: 120,
      fontFamily: "var(--font-sans, sans-serif)",
      color: "#000000",
      align: "center",
      fontWeight: "normal",
      fontStyle: "normal"
    };
    const updated = { ...design, canvasElements: [...(design.canvasElements || []), newEl] };
    applyDesignUpdate(updated);
    setSelectedElementId(newEl.id);
  };

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId || !design.canvasElements) return;
    const updatedElements = design.canvasElements.map(el => 
      el.id === selectedElementId ? { ...el, ...updates } : el
    );
    const updated = { ...design, canvasElements: updatedElements };
    applyDesignUpdate(updated);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId || !design.canvasElements) return;
    const updatedElements = design.canvasElements.filter(el => el.id !== selectedElementId);
    const updated = { ...design, canvasElements: updatedElements };
    applyDesignUpdate(updated);
    setSelectedElementId(null);
  };

  const selectedElement = design.canvasElements?.find(el => el.id === selectedElementId);

  // Load a preset
  const loadPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    
    const updated = { 
      ...design, 
      canvasElements: preset.design.canvasElements, 
      backgroundImageUrl: preset.design.backgroundImageUrl 
    }; 
    applyDesignUpdate(updated);
  };

  // Responsive Canvas Scale State
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        const availableW = width - 64; // 32px padding on each side
        const availableH = height - 64;
        const scaleW = availableW / 3508;
        const scaleH = availableH / 2480;
        setScale(Math.min(scaleW, scaleH));
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 min-h-0 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-6 shrink-0">
        <div>
          <Link href="/dashboard/templates" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Templates
          </Link>
          <h1 className="text-3xl font-bold text-zinc-700 flex items-center gap-3 mb-1">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600 shrink-0">
              <LayoutTemplate size={24} />
            </div>
            {isEdit ? "Edit Template" : "Template Studio"}
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Build and edit dynamic certificate layouts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          
          <div className="flex items-center shadow-sm rounded-lg overflow-hidden border border-zinc-200 shrink-0">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              className="bg-white hover:bg-zinc-50 text-zinc-700 px-3 py-2 border-r border-zinc-200 flex items-center justify-center disabled:opacity-50 transition-colors"
              title="Undo"
            >
              <Undo size={16} />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1}
              className="bg-white hover:bg-zinc-50 text-zinc-700 px-3 py-2 flex items-center justify-center disabled:opacity-50 transition-colors"
              title="Redo"
            >
              <Redo size={16} />
            </button>
          </div>

          {showResetConfirm ? (
            <div className="flex items-center border border-red-200 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm">
              <span className="text-xs font-semibold text-red-700 bg-red-50 px-3 py-2 border-r border-red-200 flex items-center shrink-0">
                Reset All?
              </span>
              <button
                onClick={() => {
                  applyDesignUpdate(defaultDesign);
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors border-r border-red-200 flex items-center justify-center shrink-0 text-sm font-medium"
              >
                Yes
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center justify-center shrink-0 text-sm font-medium"
              >
                No
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowResetConfirm(true)} 
              className="btn-secondary font-medium"
            >
              <RotateCcw size={16} /> <span className="hidden sm:inline">Reset</span>
            </button>
          )}
          <button onClick={handleSave} className="btn-primary font-medium min-w-[160px] justify-center" disabled={saving}>
            {saving ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : savedSuccess ? <><CheckCircle2 size={16} className="mr-2" /> Saved</> : <><Save size={16} className="mr-2" /> {isEdit ? "Update Template" : "Create Template"}</>}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* Left: Administrative Controls */}
        <div className="lg:col-span-4 flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex border-b border-zinc-200 shrink-0 p-2 bg-zinc-50/50 gap-2">
            <button className={`flex-1 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === "builder" ? "bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200" : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-700"}`} onClick={() => setActiveTab("builder")}>
              <Move size={16} /> Builder
            </button>
            <button className={`flex-1 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === "json" ? "bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200" : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-700"}`} onClick={() => setActiveTab("json")}>
              <Code2 size={16} /> JSON
            </button>
          </div>

          <div className={`flex-1 overflow-y-auto overflow-x-hidden ${activeTab === 'builder' ? 'p-6' : ''}`}>
            <AnimatePresence mode="wait">
              {/* TAB: Builder (Properties) */}
              {activeTab === "builder" ? (
                <motion.div 
                  key="builder"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-6"
                >
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Template Name *</label>
                    <input type="text" className={`input-field ${error ? 'border-red-500 ring-red-500' : ''}`} value={name} onChange={e => { 
                      setName(e.target.value); 
                      if (error) setError('');
                      if (!design.certificateTitle || design.certificateTitle === "Certificate of Completion") 
                        updateDesignField("certificateTitle", e.target.value); 
                    }} placeholder="e.g. VIP Attendee" required />
                    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Description (Optional)</label>
                    <input type="text" className="input-field" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Custom certificate template layout." />
                  </div>
                </div>

                <div className="h-px bg-zinc-200 my-6"></div>
                
                {/* Global Background */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-2 mb-3 flex items-center justify-between">
                    Canvas Background
                  </h4>
                  <label className="btn-secondary w-full justify-center cursor-pointer text-sm py-2">
                    <ImageIcon size={16} className="mr-2 text-zinc-500" /> Upload Background
                    <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {design.backgroundImageUrl && (
                    <button onClick={() => updateDesignField("backgroundImageUrl", null)} className="text-sm font-medium text-red-600 w-full text-center hover:text-red-700 transition-colors mt-2">Remove Background</button>
                  )}
                  
                  <div className="pt-3 border-t border-zinc-200 mt-4">
                    <p className="text-xs font-medium text-zinc-500 mb-3">Or load a preset:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {PRESETS.map((preset) => (
                        <button 
                          key={preset.id}
                          onClick={() => loadPreset(preset.id)} 
                          className="w-full p-3 rounded-lg border bg-white hover:bg-zinc-50 transition-colors text-xs font-semibold text-left relative overflow-hidden flex items-center shadow-sm hover:shadow"
                          style={{ borderColor: preset.color, color: preset.color }}
                        >
                          <div className="absolute top-0 right-0 w-8 h-8 opacity-10" style={{ backgroundColor: preset.color, borderBottomLeftRadius: '100%' }}></div>
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Element Properties */}
                {selectedElement ? (
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                      <h4 className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                        <MousePointer2 size={16} className="text-zinc-500" /> Element Properties
                      </h4>
                      <button onClick={deleteSelectedElement} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete Element">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {selectedElement.type.includes("Text") && (
                      <>
                        {selectedElement.type === "dynamicText" ? (
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Dynamic Field Mapping</label>
                            <select 
                              className="input-field py-2 text-sm"
                              value={selectedElement.text}
                              onChange={(e) => updateSelectedElement({ text: e.target.value })}
                            >
                              <option value="recipientName">Recipient Name</option>
                              <option value="role">Role / Title / Degree</option>
                              <option value="eventName">Event Description</option>
                              <option value="issueDate">Issue Date</option>
                              <option value="certificateId">Certificate ID / Serial No.</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Text Content</label>
                            <textarea 
                              className="input-field py-2 text-sm"
                              value={selectedElement.text}
                              onChange={(e) => updateSelectedElement({ text: e.target.value })}
                              rows={2}
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Font Size (px)</label>
                            <input type="number" className="input-field py-2 text-sm" value={selectedElement.fontSize || 16} onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Color</label>
                            <input type="color" className="w-full h-[38px] p-1 border border-zinc-200 rounded-lg cursor-pointer bg-white" value={selectedElement.color || "#000000"} onChange={(e) => updateSelectedElement({ color: e.target.value })} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-1">
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Font Family</label>
                            <select className="input-field py-2 text-sm" value={selectedElement.fontFamily || "var(--font-inter, sans-serif)"} onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}>
                              <option value="var(--font-inter, sans-serif)">Inter (Modern Sans)</option>
                              <option value="var(--font-outfit, sans-serif)">Outfit (Tech Sans)</option>
                              <option value="var(--font-spacegrotesk, sans-serif)">Space Grotesk (Display)</option>
                              <option value="var(--font-playfair, serif)">Playfair Display (Serif)</option>
                              <option value="var(--font-cormorant, serif)">Cormorant (Classic)</option>
                              <option value="var(--font-cinzel, serif)">Cinzel (Title)</option>
                              <option value="var(--font-script, cursive)">Great Vibes (Signature)</option>
                              <option value="var(--font-spacemono, monospace)">Space Mono (Tech)</option>
                              <option value="var(--font-mono, monospace)">System Monospace</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Letter Spacing (px)</label>
                            <input type="number" className="input-field py-2 text-sm" value={selectedElement.letterSpacing || 0} onChange={(e) => updateSelectedElement({ letterSpacing: Number(e.target.value) })} />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-sm">
                            <button className={`p-2 transition-colors ${selectedElement.align === 'left' ? 'bg-zinc-100 text-zinc-700' : 'text-zinc-500 hover:bg-zinc-50'}`} onClick={() => updateSelectedElement({ align: 'left' })}><AlignLeft size={16} /></button>
                            <div className="w-px bg-zinc-200"></div>
                            <button className={`p-2 transition-colors ${selectedElement.align === 'center' ? 'bg-zinc-100 text-zinc-700' : 'text-zinc-500 hover:bg-zinc-50'}`} onClick={() => updateSelectedElement({ align: 'center' })}><AlignCenter size={16} /></button>
                            <div className="w-px bg-zinc-200"></div>
                            <button className={`p-2 transition-colors ${selectedElement.align === 'right' ? 'bg-zinc-100 text-zinc-700' : 'text-zinc-500 hover:bg-zinc-50'}`} onClick={() => updateSelectedElement({ align: 'right' })}><AlignRight size={16} /></button>
                          </div>
                          <div className="flex border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-sm">
                            <button className={`p-2 transition-colors ${selectedElement.fontWeight === 'bold' ? 'bg-zinc-100 text-zinc-700' : 'text-zinc-500 hover:bg-zinc-50'}`} onClick={() => updateSelectedElement({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}><Bold size={16} /></button>
                            <div className="w-px bg-zinc-200"></div>
                            <button className={`p-2 transition-colors ${selectedElement.fontStyle === 'italic' ? 'bg-zinc-100 text-zinc-700' : 'text-zinc-500 hover:bg-zinc-50'}`} onClick={() => updateSelectedElement({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}><Italic size={16} /></button>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedElement.type === "signature" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Signatory Name</label>
                            <input 
                              type="text" 
                              className="input-field py-2 text-sm"
                              value={selectedElement.text?.split('|')[0] || ""}
                              onChange={(e) => updateSelectedElement({ text: `${e.target.value}|${selectedElement.text?.split('|')[1] || ""}` })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Signatory Title</label>
                            <input 
                              type="text" 
                              className="input-field py-2 text-sm"
                              value={selectedElement.text?.split('|')[1] || ""}
                              onChange={(e) => updateSelectedElement({ text: `${selectedElement.text?.split('|')[0] || ""}|${e.target.value}` })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Scale</label>
                            <input type="number" className="input-field py-2 text-sm" value={selectedElement.fontSize || 60} onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Ink Color</label>
                            <input type="color" className="w-full h-[38px] p-1 border border-zinc-200 rounded-lg cursor-pointer bg-white" value={selectedElement.color || "#000000"} onChange={(e) => updateSelectedElement({ color: e.target.value })} />
                          </div>
                        </div>
                        
                        <div>
                          <label className="btn-secondary w-full justify-center cursor-pointer text-sm py-2">
                            <ImageIcon size={16} className="mr-2 text-zinc-500" /> Upload Signature Image
                            <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => updateSelectedElement({ src: event.target?.result as string });
                              reader.readAsDataURL(file);
                            }} className="hidden" />
                          </label>
                          {selectedElement.src && (
                            <button onClick={() => updateSelectedElement({ src: undefined })} className="text-xs font-medium text-red-500 w-full text-center hover:text-red-700 transition-colors mt-2">Remove Image</button>
                          )}
                        </div>
                      </>
                    )}

                    {(selectedElement.type === "image" || selectedElement.type === "badge") && (
                      <div>
                        <label className="btn-secondary w-full justify-center cursor-pointer text-sm py-2">
                          <ImageIcon size={16} className="mr-2 text-zinc-500" /> {selectedElement.type === "badge" ? "Upload Custom Seal" : "Upload Graphic"}
                          <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (event) => updateSelectedElement({ src: event.target?.result as string });
                            reader.readAsDataURL(file);
                          }} className="hidden" />
                        </label>
                        {selectedElement.src && (
                          <button onClick={() => updateSelectedElement({ src: undefined })} className="text-xs font-medium text-red-500 w-full text-center hover:text-red-700 transition-colors mt-2">Remove Graphic</button>
                        )}
                      </div>
                    )}

                    {selectedElement.type === "shape" && (
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">Color</label>
                        <input type="color" className="w-full h-[38px] p-1 border border-zinc-200 rounded-lg cursor-pointer bg-white" value={selectedElement.color || "#000000"} onChange={(e) => updateSelectedElement({ color: e.target.value })} />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">X Position</label>
                        <input type="number" className="input-field py-2 text-sm" value={selectedElement.x} onChange={(e) => updateSelectedElement({ x: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">Y Position</label>
                        <input type="number" className="input-field py-2 text-sm" value={selectedElement.y} onChange={(e) => updateSelectedElement({ y: Number(e.target.value) })} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-zinc-600 mb-1">Width</label>
                        <input type="number" className="input-field py-2 text-sm" value={selectedElement.width} onChange={(e) => updateSelectedElement({ width: Number(e.target.value) })} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-10 border border-dashed border-zinc-300 rounded-xl bg-zinc-50 text-zinc-400">
                    <MousePointer2 size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">Select an element on the canvas to edit its properties.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="json"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="h-full flex flex-col"
              >
                <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <Code2 size={16} className="text-zinc-500" /> JSON Schema
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(jsonText);
                        alert("JSON copied to clipboard!");
                      }} 
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      Copy JSON
                    </button>
                    <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer m-0">
                      Import JSON
                      <input type="file" accept="application/json" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const parsed = JSON.parse(event.target?.result as string);
                            applyDesignUpdate(parsed);
                          } catch (err) {
                            alert("Invalid JSON file.");
                          }
                        };
                        reader.readAsText(file);
                      }} />
                    </label>
                  </div>
                </div>
                <div className="flex flex-1 overflow-hidden bg-white">
                  <div 
                    className="w-12 shrink-0 bg-zinc-50 border-r border-zinc-200 text-zinc-400 font-mono text-xs text-right py-4 pr-3 select-none overflow-hidden"
                    id="line-numbers"
                    style={{ lineHeight: '1.5' }}
                  >
                    {jsonText.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea 
                    className="flex-1 p-4 bg-white text-zinc-700 font-mono text-xs focus:outline-none resize-none overflow-auto whitespace-pre" 
                    style={{ lineHeight: '1.5' }}
                    value={jsonText} 
                    onChange={handleJsonChange} 
                    onScroll={(e) => {
                      const lineNumbers = document.getElementById('line-numbers');
                      if (lineNumbers) {
                        lineNumbers.scrollTop = e.currentTarget.scrollTop;
                      }
                    }}
                    wrap="off"
                    spellCheck="false"
                  />
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Live Canvas Builder */}
        <div className="lg:col-span-8 flex flex-col min-h-0 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">
          
          {/* Builder Toolbar */}
          <div className="p-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2 bg-white shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => addElement("staticText", "New Heading")} className="btn-secondary text-xs px-3 py-1.5"><Type size={14} className="mr-1 text-zinc-500" /> Text</button>
              <button onClick={() => addElement("dynamicText", "recipientName")} className="btn-secondary text-xs px-3 py-1.5"><Database size={14} className="mr-1 text-zinc-500" /> Data Field</button>
              <button onClick={() => addElement("signature", "Signatory Name|Title Here")} className="btn-secondary text-xs px-3 py-1.5"><Type size={14} className="mr-1 text-zinc-500" /> Signature</button>
              <button onClick={() => addElement("badge")} className="btn-secondary text-xs px-3 py-1.5"><Stamp size={14} className="mr-1 text-zinc-500" /> Seal/Badge</button>
              <button onClick={() => addElement("image")} className="btn-secondary text-xs px-3 py-1.5"><ImageIcon size={14} className="mr-1 text-zinc-500" /> Image</button>
              <button onClick={() => addElement("shape")} className="btn-secondary text-xs px-3 py-1.5"><Move size={14} className="mr-1 text-zinc-500" /> Divider Line</button>
              <button onClick={() => addElement("qrCode")} className="btn-secondary text-xs px-3 py-1.5"><QrCode size={14} className="mr-1 text-zinc-500" /> QR</button>
            </div>
          </div>

          <div 
            ref={containerRef}
            className="flex-1 min-h-0 relative flex items-center justify-center bg-gray-200 overflow-hidden" 
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
          >
            
            <div 
              className="w-[3508px] h-[2480px] shrink-0 relative bg-white shadow-md border border-zinc-200"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                backgroundImage: design.backgroundImageUrl ? `url(${design.backgroundImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
            >
              {design.canvasElements && design.canvasElements.map(el => {
                const isSelected = selectedElementId === el.id;
                let displayText = el.text;
                
                // Match the exact fallbacks used in CertificateView.tsx so the builder is truly WYSIWYG
                if (el.type === "dynamicText") {
                  if (el.text === "recipientName") displayText = "Jane Doe";
                  else if (el.text === "role") displayText = name || "Role / Title";
                  else if (el.text === "eventName") displayText = "Event Description";
                  else if (el.text === "issueDate") displayText = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                  else if (el.text === "certificateId") displayText = "PREVIEW-ID";
                }

                return (
                  <CanvasDraggableElement 
                    key={el.id} 
                    el={el} 
                    isSelected={isSelected} 
                    displayText={displayText} 
                    setSelectedElementId={setSelectedElementId} 
                    updateSelectedElement={updateSelectedElement} 
                    scale={scale}
                    dummyQrCode={dummyQrCode}
                  />
                );
              })}
            </div>

            {/* Floating Scale Indicator */}
            <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
              <span className="text-xs font-medium text-zinc-600 border border-zinc-200 rounded-lg px-3 py-1.5 bg-white shadow-sm whitespace-nowrap block">
                3508 x 2480 px (Scale: {Math.round(scale * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasDraggableElement({ el, isSelected, displayText, setSelectedElementId, updateSelectedElement, scale, dummyQrCode }: any) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing) return; // Don't drag while editing
    if (e.button !== 0) return; // Only left click
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return; // Ignore resize handle
    
    e.stopPropagation();
    setSelectedElementId(el.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startElX = el.x;
    const startElY = el.y;
    let isDragging = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      isDragging = true;
      const dx = (moveEvent.clientX - startX) / scale;
      const dy = (moveEvent.clientY - startY) / scale;
      updateSelectedElement({ x: startElX + dx, y: startElY + dy });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (el.type === 'staticText') {
      setIsEditing(true);
    }
  };

  return (
    <div 
      ref={nodeRef}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      style={{ 
        position: "absolute", 
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        cursor: isEditing ? "text" : "move", 
        border: isSelected ? "2px solid #3b82f6" : "1px dashed transparent", 
        padding: "2px",
        fontSize: `${el.fontSize || 16}px`,
        fontFamily: el.fontFamily || "var(--font-sans, sans-serif)",
        color: el.color || "#000000",
        textAlign: (el.align as any) || "left",
        fontWeight: el.fontWeight || "normal",
        fontStyle: el.fontStyle || "normal",
        letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : "normal",
        lineHeight: 1,
        whiteSpace: "pre-wrap",
        zIndex: isSelected ? 50 : 10,
        touchAction: "none",
        backgroundColor: el.type === 'shape' ? (el.color || '#000000') : 'transparent'
      }}
      className={isSelected ? "bg-blue-50/20" : "hover:border-zinc-300"}
    >
      {el.type === 'qrCode' ? (
        <div className="w-full h-full pointer-events-none">
          {dummyQrCode ? (
            <img src={dummyQrCode} alt="QR" style={{ width: "100%", height: "100%" }} />
          ) : (
            <div className="w-full h-full bg-zinc-100 flex items-center justify-center border-2 border-zinc-300 flex-col rounded-xl">
              <QrCode size={120} className="text-zinc-400 mb-4" />
            </div>
          )}
        </div>
      ) : el.type === 'image' || el.type === 'badge' ? (
        <div className="w-full h-full pointer-events-none flex items-center justify-center">
          {el.src ? (
            <img src={el.src} alt="" className="w-full h-full object-contain" />
          ) : el.type === 'badge' ? (
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
              <path d="M 30 70 L 30 115 L 50 100 L 70 115 L 70 70 Z" fill="#b45309" />
              <circle cx="50" cy="50" r="45" fill="#d97706" />
              <circle cx="50" cy="50" r="38" fill="#f59e0b" />
              <circle cx="50" cy="50" r="36" fill="none" stroke="#fef3c7" strokeWidth="2" strokeDasharray="4,4" />
              <path d="M 40 50 L 47 57 L 60 40" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
             <div className="w-full h-full bg-zinc-50 flex items-center justify-center border-2 border-dashed border-zinc-300 text-zinc-400 rounded-xl">
               <ImageIcon size={120} />
             </div>
          )}
        </div>
      ) : el.type === 'signature' ? (
        <div className="w-full h-full pointer-events-none flex flex-col items-center justify-end">
          {el.src ? (
            <img src={el.src} alt="Signature" style={{ maxWidth: "100%", maxHeight: "70%", objectFit: "contain", marginBottom: "10px" }} />
          ) : (
            <div style={{ fontFamily: el.fontFamily || "var(--font-script, cursive)", fontSize: `${(el.fontSize || 120) * 1.5}px`, color: el.color || "#000000", marginBottom: "0px", fontStyle: "italic", lineHeight: 1 }}>
              {el.text?.split('|')[0] || "Signature"}
            </div>
          )}
          <div style={{ width: "100%", height: "4px", backgroundColor: el.color || "#000000", marginBottom: "10px", marginTop: "10px" }} />
          <div style={{ fontSize: `${(el.fontSize || 60) * 0.4}px`, fontFamily: "var(--font-sans, sans-serif)", color: el.color || "#000000", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "4px" }}>
            {el.text?.split('|')[1] || "Title"}
          </div>
        </div>
      ) : el.type === 'shape' ? null : isEditing ? (
        <textarea
          autoFocus
          className="w-full h-full bg-transparent border-none outline-none resize-none overflow-hidden"
          style={{ 
             fontSize: 'inherit', fontFamily: 'inherit', color: 'inherit', textAlign: 'inherit',
             fontWeight: 'inherit', fontStyle: 'inherit', lineHeight: 'inherit'
          }}
          value={el.text || ''}
          onChange={(e) => updateSelectedElement({ text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => { if(e.key === 'Escape') setIsEditing(false) }}
          onPointerDown={(e) => e.stopPropagation()} // Let user click inside textarea without dragging
        />
      ) : (
        <span className="pointer-events-none block w-full">{displayText}</span>
      )}
      
      {/* Width resize handle (Side) */}
      {isSelected && !isEditing && (
        <div 
          className="resize-handle absolute -right-2 top-1/2 -translate-y-1/2 cursor-col-resize w-4 h-4 bg-white shadow-sm border border-zinc-300 rounded-full z-50 transition-colors hover:border-blue-500"
          onPointerDown={(e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startWidth = el.width;
            const onMouseMove = (moveEvent: PointerEvent) => {
              const newWidth = Math.max(50, startWidth + ((moveEvent.clientX - startX) / scale));
              updateSelectedElement({ width: newWidth });
            };
            const onMouseUp = () => {
              window.removeEventListener('pointermove', onMouseMove);
              window.removeEventListener('pointerup', onMouseUp);
            };
            window.addEventListener('pointermove', onMouseMove);
            window.addEventListener('pointerup', onMouseUp);
          }}
        />
      )}

      {/* Proportional resize handle (Corner) */}
      {isSelected && !isEditing && (
        <div 
          className="resize-handle absolute -right-2 -bottom-2 cursor-se-resize w-4 h-4 bg-white shadow-sm border border-zinc-300 rounded-full z-50 transition-colors hover:border-blue-500"
          onPointerDown={(e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startWidth = el.width;
            const startFontSize = el.fontSize || 16;
            const onMouseMove = (moveEvent: PointerEvent) => {
              const newWidth = Math.max(50, startWidth + ((moveEvent.clientX - startX) / scale));
              if (el.type === 'qrCode' || el.type === 'image') {
                updateSelectedElement({ width: newWidth, height: newWidth });
              } else {
                const ratio = newWidth / startWidth;
                const newFontSize = Math.max(8, Math.round(startFontSize * ratio));
                updateSelectedElement({ width: newWidth, fontSize: newFontSize });
              }
            };
            const onMouseUp = () => {
              window.removeEventListener('pointermove', onMouseMove);
              window.removeEventListener('pointerup', onMouseUp);
            };
            window.addEventListener('pointermove', onMouseMove);
            window.addEventListener('pointerup', onMouseUp);
          }}
        />
      )}
    </div>
  );
}

