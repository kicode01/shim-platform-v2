"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Papa from "papaparse";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { 
  FileSpreadsheet, 
  Upload, 
  UserCheck, 
  CheckCircle, 
  ArrowRight, 
  Download, 
  FileText, 
  PlusCircle, 
  AlertCircle,
  ShieldCheck,
  Loader2,
  LayoutTemplate,
  Eye,
  Zap,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import CertificateView from "@/components/CertificateView";

function GenerateCertificatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTemplateId = searchParams.get("templateId");

  const [mode, setMode] = useState<"single" | "bulk">("single");
  
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(err => console.error(err));
  }, []);

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Single Issue state
  const [singleName, setSingleName] = useState("");
  const [singleEmail, setSingleEmail] = useState("");
  const [singleRole, setSingleRole] = useState("");
  const [singleEventId, setSingleEventId] = useState("");
  const [bulkEventId, setBulkEventId] = useState("");
  const [singleIssuing, setSingleIssuing] = useState(false);
  const [singleSuccess, setSingleSuccess] = useState<any>(null);

  // Bulk Issue state
  const [csvData, setCsvData] = useState<any[]>([]);
  const [bulkStep, setBulkStep] = useState(1);
  const [bulkIssuing, setBulkIssuing] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");
  const [issuedCerts, setIssuedCerts] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    fetch("/api/templates")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTemplates(data);
          if (data.length > 0) {
            if (preselectedTemplateId) {
              const match = data.find(t => t.id === preselectedTemplateId);
              if (match) setSelectedTemplate(match);
              else setSelectedTemplate(data[0]);
            } else {
              setSelectedTemplate(data[0]);
            }
          }
        }
      })
      .catch(err => console.error("Error fetching templates:", err));
  }, [preselectedTemplateId]);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    const eventParam = searchParams.get("event");
    if (roleParam) setSingleRole(roleParam);
    if (eventParam) setSingleEventId(eventParam);
  }, [searchParams]);

  // Download Sample CSV Helper
  const downloadSampleCsv = () => {
    const csvContent = 
`name,email,role,event
"Jane Doe","jane@example.com","Participant","Global Tech Summit 2026"
"John Smith","john@example.com","Keynote Speaker","Global Tech Summit 2026"
"Alice Johnson","alice@example.com","VIP Guest","Global Tech Summit 2026"`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "shim_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = (file: File) => {
    setUploadError(null);
    if (!file) return;
    
    if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
      setUploadError("Invalid file type. Please upload a .csv file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid = results.data.filter((row: any) => row.name && String(row.name).trim().length > 0);
        setCsvData(valid);
        setPreviewIndex(0);
        if (valid.length > 0) {
          setBulkStep(2);
        } else {
          setUploadError("Uploaded CSV contains no valid rows with a 'name' column.");
        }
      },
      error: () => {
        setUploadError("Failed to parse the CSV file.");
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Helper to draw a single certificate on jsPDF
  const renderCertToPdf = async (pdf: jsPDF, cert: any, design: any, isFirst: boolean) => {
    if (!isFirst) pdf.addPage();

    if (design.canvasElements) {
      if (design.backgroundImageUrl) {
        try {
          const imgType = design.backgroundImageUrl.includes('image/png') ? 'PNG' : 'JPEG';
          pdf.addImage(design.backgroundImageUrl, imgType, 0, 0, 297, 210);
        } catch (err) {
          console.error("Failed to load custom background image", err);
        }
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 297, 210, "F");
      }

      const pxToMmX = (px: number) => px * (297 / 3508);
      const pxToMmY = (px: number) => px * (210 / 2480);

      for (const el of design.canvasElements) {
        if (el.type === 'image' && el.src) {
          try {
            const imgType = el.src.includes('image/png') ? 'PNG' : 'JPEG';
            pdf.addImage(el.src, imgType, pxToMmX(el.x), pxToMmY(el.y), pxToMmX(el.width), pxToMmY(el.height || 100));
          } catch(e) {}
          continue;
        }

        if (el.type === 'qrCode' && design.showQr !== false) {
          try {
            const validateUrl = `${window.location.origin}/validate/${cert.id}`;
            const qrDataUrl = await QRCode.toDataURL(validateUrl, { margin: 0 });
            const qrSize = pxToMmX(el.width || 100);
            pdf.addImage(qrDataUrl, "PNG", pxToMmX(el.x), pxToMmY(el.y), qrSize, qrSize);
          } catch (e) {}
          continue;
        }

        if (el.type === 'dynamicText' || el.type === 'staticText') {
          let content = el.text || "";
          if (el.type === 'dynamicText') {
            if (el.text === "recipientName") content = cert.recipientName || "";
            else if (el.text === "role") content = cert.role || "";
            else if (el.text === "eventName") content = cert.eventId || "";
            else if (el.text === "issueDate") content = new Date(cert.issueDate || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          }

          if (!content) continue;

          // Map HTML fonts to jsPDF standard fonts
          let pdfFont = "helvetica";
          if (el.fontFamily?.includes("serif")) pdfFont = "times";
          if (el.fontFamily?.includes("mono")) pdfFont = "courier";

          let pdfStyle = "normal";
          if (el.fontWeight === "bold" && el.fontStyle === "italic") pdfStyle = "bolditalic";
          else if (el.fontWeight === "bold") pdfStyle = "bold";
          else if (el.fontStyle === "italic") pdfStyle = "italic";

          pdf.setFont(pdfFont, pdfStyle);
          pdf.setFontSize((el.fontSize || 16) * (210 / 2480) * 3.5); // Adjusted font scale roughly matching HTML line heights
          pdf.setTextColor(el.color || "#000000");
          
          let textX = pxToMmX(el.x);
          if (el.align === 'center') textX += pxToMmX(el.width) / 2;
          else if (el.align === 'right') textX += pxToMmX(el.width);

          pdf.text(content, textX, pxToMmY(el.y) + (el.fontSize || 16) * 0.35, { align: el.align || "left", maxWidth: pxToMmX(el.width) });
        }
      }
      return;
    }
    // Default Rendering Logic (No Custom Background)
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 297, 210, "F");

    const primaryBorder = [79, 70, 229]; // Indigo 600 default

    pdf.setDrawColor(primaryBorder[0], primaryBorder[1], primaryBorder[2]);
    pdf.setLineWidth(3);
    pdf.rect(10, 10, 277, 190);
    pdf.setLineWidth(0.75);
    pdf.rect(13, 13, 271, 184);

    // Institution Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42);
    pdf.text(design.institutionName || "EVENT CERTIFICATE PLATFORM", 148.5, 26, { align: "center" });

    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(design.institutionSub || "OFFICIAL CERTIFICATION PORTAL", 148.5, 32, { align: "center" });

    // Certificate Title
    pdf.setFont("times", "bold");
    pdf.setFontSize(26);
    pdf.setTextColor(primaryBorder[0], primaryBorder[1], primaryBorder[2]);
    pdf.text(design.certificateTitle || "Certificate of Completion", 148.5, 52, { align: "center" });

    if (design.honorText) {
      pdf.setFont("times", "italic");
      pdf.setFontSize(11);
      pdf.setTextColor(71, 85, 105);
      pdf.text(design.honorText, 148.5, 60, { align: "center" });
    }

    // Prefix
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(design.prefixText || "This certificate is proudly presented to", 148.5, 75, { align: "center" });

    // Recipient Name with dynamic scaling
    const nameLen = (cert.recipientName || "").length;
    const pdfNameSize = nameLen > 42 ? 17 : nameLen > 28 ? 22 : 28;
    pdf.setFont("times", "bold");
    pdf.setFontSize(pdfNameSize);
    pdf.setTextColor(15, 23, 42);
    pdf.text(cert.recipientName, 148.5, 96, { align: "center" });
    pdf.setDrawColor(primaryBorder[0], primaryBorder[1], primaryBorder[2]);
    pdf.setLineWidth(0.5);
    pdf.line(70, 100, 227, 100);

    // Completion text
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(design.completionText || "has successfully completed the requirements for", 148.5, 112, { align: "center" });

    // Course Name with dynamic scaling
    const roleLen = (cert.role || "").length;
    const pdfCourseSize = roleLen > 45 ? 12 : 16;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(pdfCourseSize);
    pdf.setTextColor(15, 23, 42);
    pdf.text(cert.role || "General Event Program", 148.5, 124, { align: "center" });

    // Course Outcomes (if available)
    if (cert.eventId) {
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      const lines = cert.eventId
        .split(/\n+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
      lines.forEach((l: string, idx: number) => {
        pdf.text(l.substring(0, 95), 148.5, 136 + (idx * 4.2), { align: "center" });
      });
    }

    // Signatories Section
    const dateStr = new Date(cert.issueDate || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    
    // Left Signatory
    pdf.setFont("times", "italic");
    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42);
    pdf.text(design.firstSignatoryName?.split(" ")[1] || "Organizer", 60, 172, { align: "center" });
    pdf.setLineWidth(0.5);
    pdf.line(35, 175, 85, 175);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(design.firstSignatoryName || "Event Organizer", 60, 180, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text(design.firstSignatoryTitle || "Main Host", 60, 184, { align: "center" });

    // Center Seal representation
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(primaryBorder[0], primaryBorder[1], primaryBorder[2]);
    pdf.text("• OFFICIAL VERIFIED EVENT •", 148.5, 178, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Issued: ${dateStr}`, 148.5, 183, { align: "center" });

    // Right Signatory
    pdf.setFont("times", "italic");
    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42);
    pdf.text(design.secondSignatoryName?.split(" ")[1] || "Sponsor", 215, 172, { align: "center" });
    pdf.setLineWidth(0.5);
    pdf.line(190, 175, 240, 175);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(design.secondSignatoryName || "Keynote Speaker", 215, 180, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text(design.secondSignatoryTitle || "Guest Speaker", 215, 184, { align: "center" });

    // QR Code
    if (design.showQr !== false) {
      const validateUrl = `${window.location.origin}/validate/${cert.id}`;
      const qrDataUrl = await QRCode.toDataURL(validateUrl, { margin: 1, width: 120 });
      
      let qrX = 250;
      let qrY = 155;
      
      if (design.qrPosition === "bottom-left") {
        qrX = 17;
        qrY = 155;
      } else if (design.qrPosition === "top-right") {
        qrX = 250;
        qrY = 15;
      } else if (design.qrPosition === "top-left") {
        qrX = 17;
        qrY = 15;
      }

      pdf.addImage(qrDataUrl, "PNG", qrX, qrY, 30, 30);
      pdf.setFontSize(6);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`ID: ${cert.id.substring(0, 8)}`, qrX + 15, qrY + 33, { align: "center" });
    }
  };

  // Handle Single Issue
  const handleSingleIssue = async (e: React.FormEvent | null, shouldDownload: boolean = true) => {
    if (e) e.preventDefault();
    if (!selectedTemplate || !singleName.trim()) {
      alert("Please provide candidate name and select a template.");
      return;
    }

    setSingleIssuing(true);
    setSingleSuccess(null);

    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: singleName.trim(),
          recipientEmail: singleEmail.trim(),
          role: singleRole.trim() || selectedTemplate.name,
          eventId: singleEventId.trim(),
          templateId: selectedTemplate.id,
        })
      });

      if (!res.ok) throw new Error("Failed to issue single certificate");

      const certificate = await res.json();
      setSingleSuccess(certificate);

      if (shouldDownload) {
        // Generate PDF
        const pdf = new jsPDF("l", "mm", "a4");
        let design = {};
        try {
          design = JSON.parse(selectedTemplate.designData);
        } catch (e) {}

        await renderCertToPdf(pdf, certificate, design, true);
        pdf.save(`Certificate_${certificate.recipientName.replace(/\s+/g, "_")}.pdf`);
      }
    } catch (err) {
      console.error(err);
      alert("Error issuing credential.");
    } finally {
      setSingleIssuing(false);
    }
  };

  // Handle Bulk Issue
  const handleBulkIssue = async () => {
    if (!selectedTemplate || csvData.length === 0) return;

    setBulkIssuing(true);

    try {
      const res = await fetch("/api/certificates/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          recipients: csvData,
          defaultRole: selectedTemplate.name,
          defaultEventId: bulkEventId
        })
      });

      if (!res.ok) throw new Error("Bulk issuance failed");

      const { certificates } = await res.json();
      setIssuedCerts(certificates);

      // Generate multi-page PDF
      const pdf = new jsPDF("l", "mm", "a4");
      let design = {};
      try {
        design = JSON.parse(selectedTemplate.designData);
      } catch (e) {}

      for (let i = 0; i < certificates.length; i++) {
        await renderCertToPdf(pdf, certificates[i], design, i === 0);
      }

      pdf.save(`Batch_Certificates_${certificates.length}.pdf`);
      setBulkSuccessMsg(`Successfully generated, issued, and downloaded ${certificates.length} validated credentials.`);
      setBulkStep(3);
    } catch (err) {
      console.error(err);
      alert("Error processing batch credential issuance.");
    } finally {
      setBulkIssuing(false);
    }
  };

  let parsedPreviewDesign = {};
  if (selectedTemplate) {
    try {
      parsedPreviewDesign = JSON.parse(selectedTemplate.designData);
    } catch (e) {}
  }

  const templateSelectorBlock = (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-5 shadow-sm">
      <div className="w-full">
        <label className="text-sm font-medium text-zinc-700 mb-2 block">
          Active Template Profile
        </label>
        <div className="relative">
          <LayoutTemplate size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent cursor-pointer shadow-sm transition-shadow appearance-none"
            value={selectedTemplate?.id || ""}
            onChange={(e) => {
              const t = templates.find(item => item.id === e.target.value);
              if (t) setSelectedTemplate(t);
            }}
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t._count?.certificates || 0} Issued)
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <Link href="/dashboard/templates/new" className="flex-1 flex justify-center items-center gap-2 px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-md text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> New Template
        </Link>
        {selectedTemplate && (
          <Link href={`/dashboard/templates/${selectedTemplate.id}`} className="flex-1 flex justify-center items-center gap-2 px-4 py-2 border border-transparent bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
            Customize
          </Link>
        )}
      </div>
    </div>
  );

  let previewName = "Candidate Name";
  let previewRole = selectedTemplate?.name || "Event Role";
  let previewEvent = "";

    if (mode === "single") {
      previewName = singleName || previewName;
      previewRole = singleRole || previewRole;
      const selectedEvent = events.find(e => e.id === singleEventId);
      previewEvent = selectedEvent ? selectedEvent.name : singleEventId;
    } else if (mode === "bulk" && csvData.length > 0) {
      const activeRow = csvData[previewIndex] || csvData[0];
      previewName = activeRow.name || previewName;
      previewRole = activeRow.role || previewRole;
      if (activeRow.event) {
        previewEvent = activeRow.event;
      } else if (bulkEventId) {
        const selectedEvent = events.find(e => e.id === bulkEventId);
        previewEvent = selectedEvent ? selectedEvent.name : bulkEventId;
      }
    }

  const livePreviewBlock = (
    <div className="flex flex-col h-full min-h-0">
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 flex-1 flex flex-col relative min-h-0 overflow-hidden shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100 shrink-0">
          <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            Live Preview
          </h3>
          <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full hidden sm:inline-block">A4 Landscape</span>
        </div>

        <div className="w-full relative flex-1 min-h-0 flex flex-col justify-center overflow-hidden p-2 lg:p-4">
          <div className="w-full h-full relative mx-auto max-w-5xl">
            <CertificateView 
              certificateId="PENDING-ISSUE"
              recipientName={previewName}
              role={previewRole}
              eventId={previewEvent}
              design={parsedPreviewDesign}
              status="valid"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100 shrink-0 min-h-[32px]">
          <div className="text-xs font-medium text-zinc-400">
            Cryptographically secured on the ledger
          </div>
          {mode === "bulk" && csvData.length > 0 && (
            <div className="flex items-center border border-zinc-200 rounded-md bg-white h-8 ml-4 shadow-sm overflow-hidden">
              <button 
                onClick={() => setPreviewIndex(p => Math.max(0, p - 1))}
                disabled={previewIndex === 0}
                className="px-2 h-full hover:bg-zinc-50 text-zinc-600 disabled:opacity-50 flex items-center justify-center border-r border-zinc-200 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium px-4 whitespace-nowrap min-w-[80px] text-center text-zinc-700">
                ROW {previewIndex + 1}
              </span>
              <button 
                onClick={() => setPreviewIndex(p => Math.min(csvData.length - 1, p + 1))}
                disabled={previewIndex === csvData.length - 1}
                className="px-2 h-full hover:bg-zinc-50 text-zinc-600 disabled:opacity-50 flex items-center justify-center border-l border-zinc-200 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 min-h-0 overflow-hidden">
        
        {/* Page Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-1">
              Generation Studio
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              Issue credentials individually or bulk generate via CSV.
            </p>
          </div>

          <div className="flex p-1 bg-zinc-100 rounded-lg shrink-0 w-fit">
            <button 
              type="button" 
              onClick={() => setMode("single")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "single" 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
              }`}
            >
              <UserCheck size={16} /> Individual
            </button>
            <button 
              type="button" 
              onClick={() => setMode("bulk")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "bulk" 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
              }`}
            >
              <FileSpreadsheet size={16} /> CSV Batch
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">

          {/* ================= MODE 1: SINGLE CERTIFICATE QUICK ISSUE ================= */}
          {mode === "single" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-8 items-stretch h-full">
              
              {/* Left Column (Template Selector & Form) */}
              <div className="flex flex-col gap-8 h-full min-h-0 pr-4">
                {templateSelectorBlock}

                <div className="bg-white border border-zinc-200 rounded-xl p-8 flex-1 overflow-y-auto min-h-0 flex flex-col shadow-sm">
                  <div className="mb-6 border-b border-zinc-100 pb-5 shrink-0 flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900">Recipient Details</h3>
                      <p className="text-sm font-medium text-zinc-500 mt-1">
                        Enter the details to generate a credential instantly.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setSingleName("");
                        setSingleEmail("");
                        setSingleRole("");
                        setSingleEventId("");
                        setSingleSuccess(null);
                      }}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  {singleSuccess && (
                    <div className="mb-8 p-5 bg-emerald-50 border border-emerald-100 rounded-lg flex flex-col gap-3">
                      <div className="flex items-center gap-2 font-semibold text-emerald-800">
                        <CheckCircle size={20} />
                        <span>Credential Generated Successfully</span>
                      </div>
                      <div className="text-sm font-medium text-emerald-700">
                        Ledger ID: <code className="bg-white px-2 py-0.5 rounded border border-emerald-200 font-mono text-emerald-900 ml-1">{singleSuccess.id}</code>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Link href={`/validate/${singleSuccess.id}`} target="_blank" className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-md text-sm font-medium transition-colors shadow-sm">
                          View in Public Portal
                        </Link>
                        <button 
                          type="button" 
                          onClick={() => {
                            setSingleSuccess(null);
                            setSingleName("");
                            setSingleEmail("");
                          }} 
                          className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline transition-colors"
                        >
                          Issue another
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={(e) => handleSingleIssue(e, true)} className="flex flex-col gap-5">
                    <div>
                      <label className="text-sm font-medium text-zinc-700 mb-1.5 block">Full Name *</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent placeholder:text-zinc-400 shadow-sm" 
                        value={singleName}
                        onChange={e => setSingleName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-zinc-700 mb-1.5 block">Email Address (Optional)</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent placeholder:text-zinc-400 shadow-sm" 
                        value={singleEmail}
                        onChange={e => setSingleEmail(e.target.value)}
                        placeholder="jane@example.com"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-zinc-700 mb-1.5 block">Role / Participation</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent placeholder:text-zinc-400 shadow-sm" 
                        value={singleRole}
                        onChange={e => setSingleRole(e.target.value)}
                        placeholder={selectedTemplate?.name || "e.g. Keynote Speaker"}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-zinc-700 mb-1.5 block">Select Event</label>
                      <div className="relative">
                        <select 
                          className="w-full pl-4 pr-10 py-2.5 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-sm appearance-none cursor-pointer"
                          value={singleEventId}
                          onChange={e => setSingleEventId(e.target.value)}
                        >
                          <option value="">-- Choose an Event --</option>
                          {events.map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.name}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button 
                        type="button"
                        onClick={() => handleSingleIssue(null, false)}
                        className="sm:w-1/2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 py-3 rounded-md text-sm font-medium flex justify-center items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                        disabled={singleIssuing || !singleName.trim()}
                      >
                        {singleIssuing && <Loader2 size={18} className="animate-spin" />}
                        <span>Issue Only</span>
                      </button>
                      <button 
                        type="submit" 
                        className="sm:w-1/2 bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-md text-sm font-medium flex justify-center items-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={singleIssuing || !singleName.trim()}
                      >
                        {singleIssuing && <Loader2 size={18} className="animate-spin" />}
                        <span>Issue & Download</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Live Specimen Preview */}
              {livePreviewBlock}
            </div>
          )}

          {/* ================= MODE 2: BULK COHORT CSV BATCH ISSUANCE ================= */}
          {mode === "bulk" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-8 items-stretch h-full">
              {/* Left Column */}
              <div className="flex flex-col gap-8 h-full min-h-0 pr-4">
                {templateSelectorBlock}
                
                {bulkStep === 1 && (
                <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-4xl mx-auto w-full flex-1 overflow-y-auto min-h-0 flex flex-col shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-100 pb-5 shrink-0">
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900">Upload CSV Roster</h3>
                      <p className="text-sm font-medium text-zinc-500 mt-1">
                        Batch process thousands of certificates at once.
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={downloadSampleCsv} 
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-md text-sm font-medium transition-colors shadow-sm shrink-0 whitespace-nowrap"
                    >
                      <Download size={16} /> Sample CSV
                    </button>
                  </div>

                  <div className="mb-6 shrink-0">
                    <label className="text-sm font-medium text-zinc-700 mb-1.5 block">Select Default Event (Optional)</label>
                    <p className="text-xs text-zinc-500 mb-2">If your CSV doesn't specify an event for a row, this event will be used.</p>
                    <div className="relative">
                      <select 
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-sm appearance-none cursor-pointer"
                        value={bulkEventId}
                        onChange={e => setBulkEventId(e.target.value)}
                      >
                        <option value="">-- No Default Event --</option>
                        {events.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center relative mb-8 hover:bg-zinc-50 ${isDragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 bg-white hover:border-zinc-400"}`}
                    onClick={() => document.getElementById("csv-file-input")?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-colors ${isDragging ? "bg-zinc-900 text-white shadow-md" : "bg-zinc-100 text-zinc-500 shadow-sm"}`}>
                      <Upload size={24} />
                    </div>
                    <h4 className="text-lg font-semibold text-zinc-900 mb-2">
                      {isDragging ? "Drop CSV Here" : "Click or Drag CSV to upload"}
                    </h4>
                    <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto leading-relaxed">
                      Required: <code className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-mono mx-0.5">name</code> <br/>
                      Optional: <code className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-mono mx-0.5 mt-1 inline-block">email</code>, <code className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-mono mx-0.5 mt-1 inline-block">role</code>
                    </p>
                    {uploadError && (
                      <div className="mt-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-md">
                        {uploadError}
                      </div>
                    )}
                    <input 
                      id="csv-file-input" 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg shrink-0">
                    <div className="text-sm font-medium text-blue-800 leading-relaxed">
                      <strong className="mr-1">Pro Tip:</strong> Download the sample CSV and upload it immediately to test the batch generation pipeline without writing any real data.
                    </div>
                  </div>
                </div>
              )}

              {bulkStep === 2 && (
                <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-5xl mx-auto w-full flex-1 overflow-y-auto min-h-0 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-5 border-b border-zinc-100">
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                        Validation: {csvData.length} Records
                      </h3>
                      <p className="text-sm font-medium text-zinc-500 mt-1">
                        Review the roster before initiating batch generation.
                      </p>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => { setBulkStep(1); setCsvData([]); setPreviewIndex(0); }} 
                      className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-md text-sm font-medium transition-colors shadow-sm"
                    >
                      Change File
                    </button>
                  </div>

                  <div className="border border-zinc-200 rounded-lg overflow-hidden mb-8 max-h-[400px] overflow-y-auto shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 sticky top-0 z-10 border-b border-zinc-200">
                        <tr className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                          <th className="px-6 py-3">#</th>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 bg-white">
                        {csvData.map((row: any, i: number) => (
                          <tr 
                            key={i} 
                            onClick={() => setPreviewIndex(i)}
                            className={`transition-colors cursor-pointer ${previewIndex === i ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                          >
                            <td className="px-6 py-3 text-sm font-medium text-zinc-500">{i + 1}</td>
                            <td className="px-6 py-3 text-sm font-semibold text-zinc-900">{row.name}</td>
                            <td className="px-6 py-3 text-sm font-medium text-zinc-600">{row.email || "—"}</td>
                            <td className="px-6 py-3 text-sm font-medium text-zinc-600">{row.role || selectedTemplate?.name || "Default"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={handleBulkIssue} 
                      className="bg-zinc-900 hover:bg-zinc-800 text-white py-3 px-8 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={bulkIssuing}
                    >
                      {bulkIssuing ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                      <span>{bulkIssuing ? `Processing ${csvData.length} Records...` : `Generate ${csvData.length} Credentials`}</span>
                    </button>
                  </div>
                </div>
              )}

              {bulkStep === 3 && (
                <div className="border border-zinc-200 rounded-xl w-full flex-1 flex flex-col min-h-0 overflow-hidden bg-white shadow-sm">
                  <div className="bg-emerald-50 text-emerald-900 p-10 flex flex-col items-center justify-center flex-1 min-h-0 relative border-b border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-center leading-none relative z-10">
                      Batch Complete
                    </h2>
                  </div>
                  
                  <div className="p-8 sm:p-12 bg-white flex flex-col items-center shrink-0">
                    <p className="text-base font-medium text-zinc-600 mb-8 max-w-xl mx-auto text-center leading-relaxed">
                      {bulkSuccessMsg}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-xl">
                      <button 
                        className="px-6 py-3 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-md text-sm font-medium transition-colors shadow-sm flex-1 text-center" 
                        onClick={() => { setBulkStep(1); setCsvData([]); setPreviewIndex(0); }}
                      >
                        New Batch
                      </button>
                      <Link href="/dashboard" className="px-6 py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 flex-1">
                        View Overview <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Right Column: Live Specimen Preview */}
              {livePreviewBlock}
            </div>
          )}

        </div>
    </div>
  );
}

export default function GenerateCertificatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin mb-4 text-indigo-600" />
        <p className="font-bold text-lg text-slate-600">Loading Generation Studio...</p>
      </div>
    }>
      <GenerateCertificatesContent />
    </Suspense>
  );
}


