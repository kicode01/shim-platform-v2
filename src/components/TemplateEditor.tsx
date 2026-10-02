"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Save, ArrowLeft, Stamp, Sliders, Code2, ShieldCheck, CheckCircle2, RotateCcw, Image as ImageIcon, Move, LayoutTemplate, Loader2, Sparkles, Type, FileImage, MousePointer2, Minus, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Database, QrCode, Undo, Redo, Hand, X, ArrowUp, ArrowDown, ChevronDown, Lock, Unlock } from "lucide-react";
import { Rnd } from 'react-rnd';
import CertificateView, { CertificateDesignConfig, CanvasElement, CanvasElementType } from "@/components/CertificateView";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { QRCodeSVG } from "qrcode.react";
import { Select } from "@/components/ui/Select";
import { PRESETS } from "@/lib/presets";
import { AnimatePresence, motion } from "framer-motion";

interface TemplateEditorProps {
  initialId?: string;
  initialName?: string;
  initialDescription?: string;
  initialDesignData?: string;
  isEdit?: boolean;
}





const ELEMENT_FRIENDLY_NAMES: Record<string, string> = {
  staticText: "Text",
  dynamicText: "Data Field",
  signature: "Signature",
  badge: "Badge",
  image: "Image",
  shape: "Divider",
  qrCode: "QR Code"
};

const PRESET_COLORS = [
  "#000000", "#1e293b", "#1e3a8a", "#b45309",
  "#dc2626", "#166534", "#78716c", "#ffffff"
];

function ColorSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5 flex-wrap">
        {PRESET_COLORS.map(c => (
          <button 
            key={c}
            onClick={() => onChange(c)}
            className={`w-6 h-6 rounded-md border shadow-sm transition-transform hover:scale-110 ${value === c ? 'ring-2 ring-zinc-900 ring-offset-1' : 'border-zinc-200'}`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input type="color" className="w-8 h-8 p-0 border border-zinc-200 rounded overflow-hidden cursor-pointer bg-white shrink-0" value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="text-xs text-zinc-500 font-mono uppercase">{value}</span>
      </div>
    </div>
  );
}

function FontSizeSelector({ value, onChange }: { value: number, onChange: (val: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const presets = [12, 14, 16, 18, 24, 32, 36, 48, 60, 72, 96, 120];
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert internal pixels to standard points (1 pt Γëê 4.166 px at 300 DPI)
  const pxToPt = (px: number) => Math.round(px / 4.166667);
  const ptToPx = (pt: number) => Math.round(pt * 4.166667);

  const displayValue = value ? pxToPt(value) : '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div className="input-field p-0 flex items-center overflow-hidden focus-within:border-zinc-400 focus-within:shadow-[0_0_0_2px_rgba(24,24,27,0.1)]">
        <input 
          type="text"
          inputMode="numeric"
          className="w-full py-2 pl-3 text-sm outline-none bg-transparent text-zinc-900" 
          value={displayValue} 
          onChange={(e) => {
            const pt = Number(e.target.value.replace(/[^0-9]/g, ''));
            if (pt > 0) onChange(ptToPx(pt));
          }} 
        />
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="pr-3 pl-2 py-2 text-zinc-800 outline-none flex items-center justify-center cursor-default"
        >
          <ChevronDown size={14} strokeWidth={2.5} />
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-48 overflow-y-auto py-1"
          >
            {presets.map(p => (
              <button
                key={p}
                className={`w-full text-left px-3 py-1 text-sm hover:bg-[#0078d4] hover:text-white transition-colors ${displayValue === p ? 'bg-[#0078d4] text-white' : 'text-zinc-900'}`}
                onClick={() => { onChange(ptToPx(p)); setIsOpen(false); }}
              >
                {p}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FONT_SUPPORTED_WEIGHTS: Record<string, string[]> = {
  "Playfair Display": [
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Cinzel": [
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Cormorant Garamond": [
    "300",
    "400",
    "500",
    "600",
    "700"
  ],
  "Merriweather": [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Lora": [
    "400",
    "500",
    "600",
    "700"
  ],
  "PT Serif": [
    "400",
    "700"
  ],
  "Noto Serif": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Libre Baskerville": [
    "400",
    "500",
    "600",
    "700"
  ],
  "EB Garamond": [
    "400",
    "500",
    "600",
    "700",
    "800"
  ],
  "Bodoni Moda": [
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Prata": [
    "400"
  ],
  "Castoro": [
    "400"
  ],
  "DM Serif Display": [
    "400"
  ],
  "Fraunces": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Cardo": [
    "400",
    "700"
  ],
  "Inter": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Roboto": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Open Sans": [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800"
  ],
  "Montserrat": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Lato": [
    "100",
    "300",
    "400",
    "700",
    "900"
  ],
  "Poppins": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Oswald": [
    "200",
    "300",
    "400",
    "500",
    "600",
    "700"
  ],
  "Raleway": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Outfit": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Space Grotesk": [
    "300",
    "400",
    "500",
    "600",
    "700"
  ],
  "Work Sans": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Rubik": [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Manrope": [
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800"
  ],
  "DM Sans": [
    "100",
    "1000",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Syne": [
    "400",
    "500",
    "600",
    "700",
    "800"
  ],
  "Bebas Neue": [
    "400"
  ],
  "Anton": [
    "400"
  ],
  "Lobster": [
    "400"
  ],
  "Abril Fatface": [
    "400"
  ],
  "Righteous": [
    "400"
  ],
  "Alfa Slab One": [
    "400"
  ],
  "Unica One": [
    "400"
  ],
  "Fjalla One": [
    "400"
  ],
  "Titan One": [
    "400"
  ],
  "Syncopate": [
    "400",
    "700"
  ],
  "Bowlby One": [
    "400"
  ],
  "Oleo Script": [
    "400",
    "700"
  ],
  "Russo One": [
    "400"
  ],
  "Yeseva One": [
    "400"
  ],
  "Rampart One": [
    "400"
  ],
  "Great Vibes": [
    "400"
  ],
  "Dancing Script": [
    "400",
    "500",
    "600",
    "700"
  ],
  "Pacifico": [
    "400"
  ],
  "Caveat": [
    "400",
    "500",
    "600",
    "700"
  ],
  "Satisfy": [
    "400"
  ],
  "Sacramento": [
    "400"
  ],
  "Alex Brush": [
    "400"
  ],
  "Parisienne": [
    "400"
  ],
  "Monsieur La Doulaise": [
    "400"
  ],
  "Herr Von Muellerhoff": [
    "400"
  ],
  "Pinyon Script": [
    "400"
  ],
  "Tangerine": [
    "400",
    "700"
  ],
  "Clicker Script": [
    "400"
  ],
  "Allura": [
    "400"
  ],
  "Rochester": [
    "400"
  ],
  "Fira Code": [
    "300",
    "400",
    "500",
    "600",
    "700"
  ],
  "Space Mono": [
    "400",
    "700"
  ],
  "JetBrains Mono": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800"
  ],
  "Inconsolata": [
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "Source Code Pro": [
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
  ],
  "IBM Plex Mono": [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700"
  ],
  "Ubuntu Mono": [
    "400",
    "700"
  ],
  "PT Mono": [
    "400"
  ],
  "Anonymous Pro": [
    "400",
    "700"
  ],
  "Share Tech Mono": [
    "400"
  ],
  "VT323": [
    "400"
  ],
  "Courier Prime": [
    "400",
    "700"
  ],
  "Cutive Mono": [
    "400"
  ],
  "Overpass Mono": [
    "300",
    "400",
    "500",
    "600",
    "700"
  ],
  "Oxygen Mono": [
    "400"
  ]
};

const GOOGLE_FONTS = [
  { group: "Serif & Luxury", fonts: ["Playfair Display", "Cinzel", "Cormorant Garamond", "Merriweather", "Lora", "PT Serif", "Noto Serif", "Libre Baskerville", "EB Garamond", "Bodoni Moda", "Prata", "Castoro", "DM Serif Display", "Fraunces", "Cardo"] },
  { group: "Sans-Serif & Modern", fonts: ["Inter", "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Oswald", "Raleway", "Outfit", "Space Grotesk", "Work Sans", "Rubik", "Manrope", "DM Sans", "Syne"] },
  { group: "Display & Impact", fonts: ["Bebas Neue", "Anton", "Lobster", "Abril Fatface", "Righteous", "Alfa Slab One", "Unica One", "Fjalla One", "Titan One", "Syncopate", "Bowlby One", "Oleo Script", "Russo One", "Yeseva One", "Rampart One"] },
  { group: "Handwriting & Signatures", fonts: ["Great Vibes", "Dancing Script", "Pacifico", "Caveat", "Satisfy", "Sacramento", "Alex Brush", "Parisienne", "Monsieur La Doulaise", "Herr Von Muellerhoff", "Pinyon Script", "Tangerine", "Clicker Script", "Allura", "Rochester"] },
  { group: "Monospace & Tech", fonts: ["Fira Code", "Space Mono", "JetBrains Mono", "Inconsolata", "Source Code Pro", "IBM Plex Mono", "Ubuntu Mono", "PT Mono", "Anonymous Pro", "Share Tech Mono", "VT323", "Courier Prime", "Cutive Mono", "Overpass Mono", "Oxygen Mono"] }
];

const PRESET_CATEGORIES = [
  {
    "name": "Corporate & Professional",
    "orientation": "landscape",
    "items": [
      {
        "id": "corp-01",
        "name": "Swiss International Style",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxwb2x5Z29uIHBvaW50cz0iODQxLDc5MyAxMTIyLDc5MyAxMTIyLDIwMCIgZmlsbD0iIzBBMTkyRiIvPgogIDxwb2x5Z29uIHBvaW50cz0iOTAwLDc5MyAxMTIyLDc5MyAxMTIyLDQwMCIgZmlsbD0iI0Q0QUYzNyIvPgogIDxwb2x5Z29uIHBvaW50cz0iOTUwLDc5MyAxMTIyLDc5MyAxMTIyLDUwMCIgZmlsbD0iIzBBMTkyRiIvPgo8L3N2Zz4="
      },
      {
        "id": "corp-02",
        "name": "Asymmetrical Corporate Edge",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMCwwIDIwMCwwIDM1MCw3OTMgMCw3OTMiIGZpbGw9IiMzMzMzMzMiLz4KICA8cG9seWdvbiBwb2ludHM9IjAsMCAxMDAsMCAyNTAsNzkzIDAsNzkzIiBmaWxsPSIjMDY1RjQ2Ii8+Cjwvc3ZnPg=="
      },
      {
        "id": "corp-03",
        "name": "Minimalist Perimeter Frame",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjEwNjIiIGhlaWdodD0iNzMzIiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTExMTEiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxyZWN0IHg9IjMwIiB5PSIyNjQiIHdpZHRoPSIxMiIgaGVpZ2h0PSIyNjQiIGZpbGw9IiNENEFGMzciLz4KPC9zdmc+"
      },
      {
        "id": "corp-04",
        "name": "Corporate Color Blocking",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMCw3OTMgMCw0MDAgMTEyMiw3MDAgMTEyMiw3OTMiIGZpbGw9IiM2NDc0OEIiLz4KICA8cG9seWdvbiBwb2ludHM9IjAsNzkzIDAsNTUwIDExMjIsNzkzIiBmaWxsPSIjOTkxQjFCIi8+Cjwvc3ZnPg=="
      },
      {
        "id": "corp-05",
        "name": "Architectural Grid",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxwYXR0ZXJuIGlkPSJhcmNoR3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNFNUU0RTIiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPC9wYXR0ZXJuPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYXJjaEdyaWQpIi8+CiAgPHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMTAyMiIgaGVpZ2h0PSI2OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0IwQzRERSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMyIgZmlsbD0iI0IwQzRERSIvPgogIDxjaXJjbGUgY3g9IjEwNzIiIGN5PSI1MCIgcj0iMyIgZmlsbD0iI0IwQzRERSIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNzQzIiByPSIzIiBmaWxsPSIjQjBDNERFIi8+CiAgPGNpcmNsZSBjeD0iMTA3MiIgY3k9Ijc0MyIgcj0iMyIgZmlsbD0iI0IwQzRERSIvPgo8L3N2Zz4="
      },
      {
        "id": "corp-06",
        "name": "Subtle Monoline Pinstripe",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEwNDIiIGhlaWdodD0iNzEzIiBmaWxsPSJub25lIiBzdHJva2U9IiNDQzc3MjIiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxyZWN0IHg9IjQ1IiB5PSI0NSIgd2lkdGg9IjEwMzIiIGhlaWdodD0iNzAzIiBmaWxsPSJub25lIiBzdHJva2U9IiNDQzc3MjIiIHN0cm9rZS13aWR0aD0iMC4yNSIvPgo8L3N2Zz4="
      },
      {
        "id": "corp-07",
        "name": "Tech-Corporate Crossover",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxwb2x5Z29uIHBvaW50cz0iNTAwLDAgMTEyMiwwIDExMjIsNTAwIiBmaWxsPSIjMDAwMDgwIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI3MDAsMCAxMTIyLDAgMTEyMiwzMDAiIGZpbGw9IiMwMDdGRkYiLz4KICA8cG9seWdvbiBwb2ludHM9IjkwMCwwIDExMjIsMCAxMTIyLDE1MCIgZmlsbD0iIzAwRkZGRiIvPgo8L3N2Zz4="
      },
      {
        "id": "corp-08",
        "name": "Bauhaus Inspired Business",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjAiIHk9IjcwMCIgd2lkdGg9IjExMjIiIGhlaWdodD0iOTMiIGZpbGw9IiMzNjQ1NEYiLz4KICA8cmVjdCB4PSIyMDAiIHk9IjUwMCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSIyOTMiIGZpbGw9IiMxOTE5NzAiLz4KICA8Y2lyY2xlIGN4PSI0NTAiIGN5PSI3MDAiIHI9IjEyMCIgZmlsbD0iI0ZGREI1OCIvPgo8L3N2Zz4="
      },
      {
        "id": "corp-09",
        "name": "Diagonal Split Bleed",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMCw2MzQgMTEyMiw2MzQgMTEyMiw3OTMgMCw3OTMiIGZpbGw9IiM0QjAwODIiLz4KICA8bGluZSB4MT0iMCIgeTE9IjYyNiIgeDI9IjExMjIiIHkyPSI2MjYiIHN0cm9rZT0iI0MwQzBDMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+Cjwvc3ZnPg=="
      },
      {
        "id": "corp-10",
        "name": "The Executive Ribbon",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxwb2x5Z29uIHBvaW50cz0iNTAsMCAxNTAsMCAxNTAsNzkzIDUwLDc5MyIgZmlsbD0iIzAwMDA4MCIvPgogIDxwb2x5Z29uIHBvaW50cz0iNTAsMTUwIDE1MCwyMDAgMTUwLDI1MCA1MCwyMDAiIGZpbGw9IiMwMDdCQTciLz4KICA8cG9seWdvbiBwb2ludHM9IjUwLDYwMCAxNTAsNTUwIDE1MCw1MDAgNTAsNTUwIiBmaWxsPSIjMDA3QkE3Ii8+Cjwvc3ZnPg=="
      }
    ]
  },
  {
    "name": "Academic & Education",
    "orientation": "landscape",
    "items": [
      {
        "id": "acad-01",
        "name": "Victorian Filigree",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZGRkZGMCIvPgogIDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEwNDIiIGhlaWdodD0iNzEzIiBmaWxsPSJub25lIiBzdHJva2U9IiMyQjJCMkIiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwYXRoIGQ9Ik0gNDAgNDAgUSAxMDAgMTAwIDQwIDE2MCBRIDEwMCAxMDAgMTYwIDQwIFoiIGZpbGw9IiMyQjJCMkIiLz4KICA8cGF0aCBkPSJNIDEwODIgNDAgUSAxMDIyIDEwMCAxMDgyIDE2MCBRIDEwMjIgMTAwIDk2MiA0MCBaIiBmaWxsPSIjMkIyQjJCIi8+CiAgPHBhdGggZD0iTSA0MCA3NTMgUSAxMDAgNjkzIDQwIDYzMyBRIDEwMCA2OTMgMTYwIDc1MyBaIiBmaWxsPSIjMkIyQjJCIi8+CiAgPHBhdGggZD0iTSAxMDgyIDc1MyBRIDEwMjIgNjkzIDEwODIgNjMzIFEgMTAyMiA2OTMgOTYyIDc1MyBaIiBmaWxsPSIjMkIyQjJCIi8+CiAgPGNpcmNsZSBjeD0iNTYxIiBjeT0iNzAwIiByPSI1MCIgZmlsbD0iI0Q0QUYzNyIvPgogIDxjaXJjbGUgY3g9IjU2MSIgY3k9IjcwMCIgcj0iNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRkZGMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI0IDQiLz4KPC9zdmc+"
      },
      {
        "id": "acad-02",
        "name": "Olive Branch Motif",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEwNDIiIGhlaWdodD0iNzEzIiBmaWxsPSJub25lIiBzdHJva2U9IiMzNTVFM0IiIHN0cm9rZS13aWR0aD0iMSIvPgogIDwhLS0gTGVmdCBsYXVyZWwgLS0+CiAgPHBhdGggZD0iTSA4MCA0MDAgUSAxMjAgMzAwIDgwIDIwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzU1RTNCIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cGF0aCBkPSJNIDgwIDQwMCBRIDEyMCA1MDAgODAgNjAwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzNTVFM0IiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxlbGxpcHNlIGN4PSIxMDAiIGN5PSIzNTAiIHJ4PSIyMCIgcnk9IjgiIHRyYW5zZm9ybT0icm90YXRlKC0zMCAxMDAgMzUwKSIgZmlsbD0iI0Q0QUYzNyIvPgogIDxlbGxpcHNlIGN4PSIxMDAiIGN5PSI0NTAiIHJ4PSIyMCIgcnk9IjgiIHRyYW5zZm9ybT0icm90YXRlKDMwIDEwMCA0NTApIiBmaWxsPSIjRDRBRjM3Ii8+CiAgPCEtLSBSaWdodCBsYXVyZWwgLS0+CiAgPHBhdGggZD0iTSAxMDQyIDQwMCBRIDEwMDIgMzAwIDEwNDIgMjAwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzNTVFM0IiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwYXRoIGQ9Ik0gMTA0MiA0MDAgUSAxMDAyIDUwMCAxMDQyIDYwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzU1RTNCIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjM1MCIgcng9IjIwIiByeT0iOCIgdHJhbnNmb3JtPSJyb3RhdGUoMzAgMTAyMiAzNTApIiBmaWxsPSIjRDRBRjM3Ii8+CiAgPGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI0NTAiIHJ4PSIyMCIgcnk9IjgiIHRyYW5zZm9ybT0icm90YXRlKC0zMCAxMDIyIDQ1MCkiIGZpbGw9IiNENEFGMzciLz4KPC9zdmc+"
      },
      {
        "id": "acad-03",
        "name": "Gothic Arch Border",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjEwNjIiIGhlaWdodD0iNzMzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwODAiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjEwNjIiIGhlaWdodD0iNjAiIGZpbGw9IiMwMDAwODAiLz4KICA8IS0tIEdvdGhpYyBhcmNoZXMgYWxvbmcgdG9wIC0tPgogIDxwYXRoIGQ9Ik0gMTMwIDkwIEwgMTMwIDEyMCBRIDE1NSAxMDAgMTgwIDEyMCBMIDE4MCA5MCBaIiBmaWxsPSIjRDRBRjM3Ii8+CiAgPHBhdGggZD0iTSAzMzAgOTAgTCAzMzAgMTIwIFEgMzU1IDEwMCAzODAgMTIwIEwgMzgwIDkwIFoiIGZpbGw9IiNENEFGMzciLz4KICA8cGF0aCBkPSJNIDUzMCA5MCBMIDUzMCAxMjAgUSA1NTUgMTAwIDU4MCAxMjAgTCA1ODAgOTAgWiIgZmlsbD0iI0Q0QUYzNyIvPgogIDxwYXRoIGQ9Ik0gNzMwIDkwIEwgNzMwIDEyMCBRIDc1NSAxMDAgNzgwIDEyMCBMIDc4MCA5MCBaIiBmaWxsPSIjRDRBRjM3Ii8+CiAgPHBhdGggZD0iTSA5MzAgOTAgTCA5MzAgMTIwIFEgOTU1IDEwMCA5ODAgMTIwIEwgOTgwIDkwIFoiIGZpbGw9IiNENEFGMzciLz4KPC9zdmc+"
      },
      {
        "id": "acad-04",
        "name": "Simple Double Line",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZGRkREMCIvPgogIDxyZWN0IHg9IjQ4IiB5PSI0OCIgd2lkdGg9IjEwMjYiIGhlaWdodD0iNjk3IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTExMTEiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxyZWN0IHg9IjU2IiB5PSI1NiIgd2lkdGg9IjEwMTAiIGhlaWdodD0iNjgxIiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTExMTEiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHBhdGggZD0iTSA0OCAxMDAgUSAxMDAgMTAwIDEwMCA0OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTExMTExIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cGF0aCBkPSJNIDEwNzQgMTAwIFEgMTAyMiAxMDAgMTAyMiA0OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTExMTExIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cGF0aCBkPSJNIDQ4IDY5MyBRIDEwMCA2OTMgMTAwIDc0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTExMTExIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cGF0aCBkPSJNIDEwNzQgNjkzIFEgMTAyMiA2OTMgMTAyMiA3NDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzExMTExMSIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg=="
      },
      {
        "id": "acad-05",
        "name": "Burgundy & Gold",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMTIyIiBoZWlnaHQ9Ijc5MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODAwMDIwIiBzdHJva2Utd2lkdGg9IjkwIi8+CiAgPHJlY3QgeD0iNTUiIHk9IjU1IiB3aWR0aD0iMTAxMiIgaGVpZ2h0PSI2ODMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHJlY3QgeD0iMjUiIHk9IjI1IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM4MDAwMjAiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHJlY3QgeD0iMTA1NyIgeT0iMjUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzgwMDAyMCIgc3Ryb2tlPSIjRDRBRjM3IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cmVjdCB4PSIyNSIgeT0iNzI4IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM4MDAwMjAiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHJlY3QgeD0iMTA1NyIgeT0iNzI4IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM4MDAwMjAiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGNpcmNsZSBjeD0iNDUiIGN5PSI0NSIgcj0iMTAiIGZpbGw9IiNENEFGMzciLz4KICA8Y2lyY2xlIGN4PSIxMDc3IiBjeT0iNDUiIHI9IjEwIiBmaWxsPSIjRDRBRjM3Ii8+CiAgPGNpcmNsZSBjeD0iNDUiIGN5PSI3NDgiIHI9IjEwIiBmaWxsPSIjRDRBRjM3Ii8+CiAgPGNpcmNsZSBjeD0iMTA3NyIgY3k9Ijc0OCIgcj0iMTAiIGZpbGw9IiNENEFGMzciLz4KPC9zdmc+"
      },
      {
        "id": "acad-06",
        "name": "Ribbon Corner",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZGRkZGMCIvPgogIDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEwNDIiIGhlaWdodD0iNzEzIiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTExMTEiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwb2x5Z29uIHBvaW50cz0iMCwwIDIwMCwwIDAsMjAwIiBmaWxsPSIjREMxNDNDIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIwLDIwMCA2MCwxNDAgMCwxNjAiIGZpbGw9IiM4QjAwMDAiLz4KICA8cG9seWdvbiBwb2ludHM9IjIwMCwwIDE0MCw2MCAxNjAsMCIgZmlsbD0iIzhCMDAwMCIvPgo8L3N2Zz4="
      },
      {
        "id": "acad-07",
        "name": "Greek Key Pattern",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMTIyIiBoZWlnaHQ9Ijc5MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEIwQjBCIiBzdHJva2Utd2lkdGg9IjYwIi8+CiAgPHBhdHRlcm4gaWQ9ImdyZWVrIiB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgPHBhdGggZD0iTSAwIDE1IEwgNjAgMTUgTCA2MCA0NSBMIDMwIDQ1IEwgMzAgMzAgTCA0NSAzMCBMIDQ1IDE1IiBmaWxsPSJub25lIiBzdHJva2U9IiNENEFGMzciIHN0cm9rZS13aWR0aD0iNCIvPgogIDwvcGF0dGVybj4KICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTEyMiIgaGVpZ2h0PSIzMCIgZmlsbD0idXJsKCNncmVlaykiLz4KICA8cmVjdCB4PSIwIiB5PSI3NjMiIHdpZHRoPSIxMTIyIiBoZWlnaHQ9IjMwIiBmaWxsPSJ1cmwoI2dyZWVrKSIvPgogIDxyZWN0IHg9IjI1IiB5PSIzMCIgd2lkdGg9IjEwNzIiIGhlaWdodD0iNzMzIiBmaWxsPSJub25lIiBzdHJva2U9IiNENEFGMzciIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4="
      },
      {
        "id": "acad-08",
        "name": "Heavy Serif Frame",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjEwNjIiIGhlaWdodD0iNzMzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwODAiIHN0cm9rZS13aWR0aD0iOCIvPgogIDxyZWN0IHg9IjQyIiB5PSI0MiIgd2lkdGg9IjEwMzgiIGhlaWdodD0iNzA5IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwODAiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHJlY3QgeD0iNDgiIHk9IjQ4IiB3aWR0aD0iMTAyNiIgaGVpZ2h0PSI2OTciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDA4MCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzAwMDA4MCIvPgogIDxyZWN0IHg9IjEwNzciIHk9IjE1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMwMDAwODAiLz4KICA8cmVjdCB4PSIxNSIgeT0iNzQ4IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMwMDAwODAiLz4KICA8cmVjdCB4PSIxMDc3IiB5PSI3NDgiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzAwMDA4MCIvPgo8L3N2Zz4="
      },
      {
        "id": "acad-09",
        "name": "Floral Damask",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZGRkZGMCIvPgogIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMTIyIiBoZWlnaHQ9Ijc5MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRjdFN0NFIiBzdHJva2Utd2lkdGg9IjE4MCIvPgogIDxwYXR0ZXJuIGlkPSJkYW1hc2siIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICA8cGF0aCBkPSJNIDMwIDAgUSA2MCAzMCAzMCA2MCBRIDAgMzAgMzAgMCBaIiBmaWxsPSIjRUFENEI0Ii8+CiAgICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxMCIgZmlsbD0iI0ZGRkZGMCIvPgogIDwvcGF0dGVybj4KICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTEyMiIgaGVpZ2h0PSI5MCIgZmlsbD0idXJsKCNkYW1hc2spIi8+CiAgPHJlY3QgeD0iMCIgeT0iNzAzIiB3aWR0aD0iMTEyMiIgaGVpZ2h0PSI5MCIgZmlsbD0idXJsKCNkYW1hc2spIi8+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjkwIiBoZWlnaHQ9Ijc5MyIgZmlsbD0idXJsKCNkYW1hc2spIi8+CiAgPHJlY3QgeD0iMTAzMiIgeT0iMCIgd2lkdGg9IjkwIiBoZWlnaHQ9Ijc5MyIgZmlsbD0idXJsKCNkYW1hc2spIi8+CiAgPHJlY3QgeD0iOTAiIHk9IjkwIiB3aWR0aD0iOTQyIiBoZWlnaHQ9IjYxMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRUFENEI0IiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+"
      },
      {
        "id": "acad-10",
        "name": "Classic Crest",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEwNDIiIGhlaWdodD0iNzEzIiBmaWxsPSJub25lIiBzdHJva2U9IiM3MDgwOTAiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxwYXRoIGQ9Ik0gNDAgNDAgUSA4MCA4MCA0MCAxMjAgWiIgZmlsbD0iI0Q0QUYzNyIvPgogIDxwYXRoIGQ9Ik0gMTA4MiA0MCBRIDEwNDIgODAgMTA4MiAxMjAgWiIgZmlsbD0iI0Q0QUYzNyIvPgogIDxwYXRoIGQ9Ik0gNDAgNzUzIFEgODAgNzEzIDQwIDY3MyBaIiBmaWxsPSIjRDRBRjM3Ii8+CiAgPHBhdGggZD0iTSAxMDgyIDc1MyBRIDEwNDIgNzEzIDEwODIgNjczIFoiIGZpbGw9IiNENEFGMzciLz4KICA8cGF0aCBkPSJNIDUyMSA0MCBMIDU2MSAxMDAgTCA2MDEgNDAgWiIgZmlsbD0iIzcwODA5MCIvPgogIDwhLS0gQ3Jlc3QgcGxhY2Vob2xkZXIgLS0+CiAgPHBhdGggZD0iTSA1MjEgNjAgTCA2MDEgNjAgTCA2MDEgMTAwIFEgNTYxIDE0MCA1MjEgMTAwIFoiIGZpbGw9IiNENEFGMzciLz4KPC9zdmc+"
      }
    ]
  },
  {
    "name": "Tech & Hackathons",
    "orientation": "landscape",
    "items": [
      {
        "id": "tech-01",
        "name": "Cybernetic Node Network",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzBCMEIwQiIvPgogIDwhLS0gVG9wIExlZnQgLS0+CiAgPHBvbHlsaW5lIHBvaW50cz0iNTAsMjAwIDUwLDUwIDIwMCw1MCAyNTAsMTAwIDM1MCwxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRkZGRiIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSIyMDAiIHI9IjgiIGZpbGw9IiMwMEZGRkYiLz4KICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSI1MCIgcj0iNSIgZmlsbD0iI0ZGMDBGRiIvPgogIDxjaXJjbGUgY3g9IjM1MCIgY3k9IjEwMCIgcj0iOCIgZmlsbD0iIzAwRkZGRiIvPgogIDxwb2x5bGluZSBwb2ludHM9IjEwMCwyNTAgMTAwLDEwMCAxNTAsNTAgMzAwLDUwIiBmaWxsPSJub25lIiBzdHJva2U9IiNGRjAwRkYiIHN0cm9rZS13aWR0aD0iMiIvPgogIDwhLS0gQm90dG9tIFJpZ2h0IC0tPgogIDxwb2x5bGluZSBwb2ludHM9IjEwNzIsNTkzIDEwNzIsNzQzIDkyMiw3NDMgODcyLDY5MyA3NzIsNjkzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMEZGRkYiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxjaXJjbGUgY3g9IjEwNzIiIGN5PSI1OTMiIHI9IjgiIGZpbGw9IiMwMEZGRkYiLz4KICA8Y2lyY2xlIGN4PSI5MjIiIGN5PSI3NDMiIHI9IjUiIGZpbGw9IiNGRjAwRkYiLz4KICA8Y2lyY2xlIGN4PSI3NzIiIGN5PSI2OTMiIHI9IjgiIGZpbGw9IiMwMEZGRkYiLz4KICA8cG9seWxpbmUgcG9pbnRzPSIxMDIyLDU0MyAxMDIyLDY5MyA5NzIsNzQzIDgyMiw3NDMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGMDBGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg=="
      },
      {
        "id": "tech-02",
        "name": "Isometric Tech Grid",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIDYwMCkiPgogICAgPCEtLSBJc29tZXRyaWMgUmhvbWJ1c2VzIC0tPgogICAgPHBvbHlnb24gcG9pbnRzPSI1MCw1MCAxMDAsMjUgMTUwLDUwIDEwMCw3NSIgZmlsbD0iIzM5RkYxNCIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIxMDAsNzUgMTUwLDUwIDE1MCwxMDAgMTAwLDEyNSIgZmlsbD0iIzJGNEY0RiIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI1MCw1MCAxMDAsNzUgMTAwLDEyNSA1MCwxMDAiIGZpbGw9IiMyMDMwMzAiLz4KCiAgICA8cG9seWdvbiBwb2ludHM9IjE1MCwxMDAgMjAwLDc1IDI1MCwxMDAgMjAwLDEyNSIgZmlsbD0iIzM5RkYxNCIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIyMDAsMTI1IDI1MCwxMDAgMjUwLDE1MCAyMDAsMTc1IiBmaWxsPSIjMkY0RjRGIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjE1MCwxMDAgMjAwLDEyNSAyMDAsMTc1IDE1MCwxNTAiIGZpbGw9IiMyMDMwMzAiLz4KICAgIAogICAgPHBvbHlnb24gcG9pbnRzPSI5MDAsNTAgOTUwLDI1IDEwMDAsNTAgOTUwLDc1IiBmaWxsPSIjMzlGRjE0Ii8+CiAgICA8cG9seWdvbiBwb2ludHM9Ijk1MCw3NSAxMDAwLDUwIDEwMDAsMTAwIDk1MCwxMjUiIGZpbGw9IiMyRjRGNEYiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iOTAwLDUwIDk1MCw3NSA5NTAsMTI1IDkwMCwxMDAiIGZpbGw9IiMyMDMwMzAiLz4KICA8L2c+Cjwvc3ZnPg=="
      },
      {
        "id": "tech-03",
        "name": "Flat Tech-Brutalism",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEwNDIiIGhlaWdodD0iNzEzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxyZWN0IHg9IjAiIHk9IjgwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMDAwMDAwIi8+CiAgPHJlY3QgeD0iMjAiIHk9IjEwMCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI0ZGRkYwMCIvPgogIDxyZWN0IHg9IjAiIHk9IjYwMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMwMDAwMDAiLz4KICA8cmVjdCB4PSIxNTAiIHk9IjU1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRkZGMDAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+Cjwvc3ZnPg=="
      },
      {
        "id": "tech-04",
        "name": "Minimalist Digital Wireframe",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjEwNjIiIGhlaWdodD0iNzMzIiBmaWxsPSJub25lIiBzdHJva2U9IiM3REY5RkYiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMTA0MiIgaGVpZ2h0PSI3MTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdERjlGRiIgc3Ryb2tlLXdpZHRoPSIwLjI1Ii8+CiAgPCEtLSBDcm9zc2hhaXJzIC0tPgogIDxwYXRoIGQ9Ik0gMjAgNDAgTCA2MCA0MCBNIDQwIDIwIEwgNDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdERjlGRiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8cGF0aCBkPSJNIDEwNjIgNDAgTCAxMTAyIDQwIE0gMTA4MiAyMCBMIDEwODIgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdERjlGRiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8cGF0aCBkPSJNIDIwIDc1MyBMIDYwIDc1MyBNIDQwIDczMyBMIDQwIDc3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN0RGOUZGIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDxwYXRoIGQ9Ik0gMTA2MiA3NTMgTCAxMTAyIDc1MyBNIDEwODIgNzMzIEwgMTA4MiA3NzMyIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdERjlGRiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9zdmc+"
      },
      {
        "id": "tech-05",
        "name": "Binary Algorithm Blocks",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFBMUExQSIvPgogIDwhLS0gVG9wIGJsb2NrcyAtLT4KICA8cmVjdCB4PSI1MCIgeT0iMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzM2NDU0RiIvPgogIDxyZWN0IHg9IjE1MCIgeT0iNDAiIHdpZHRoPSIyMjAiIGhlaWdodD0iNjAiIGZpbGw9IiM3MDgwOTAiLz4KICA8cmVjdCB4PSIxNTAiIHk9IjQwIiB3aWR0aD0iODAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRjU3MzMiLz4KICA8cmVjdCB4PSI0NTAiIHk9IjAiIHdpZHRoPSIzMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMzNjQ1NEYiLz4KICA8cmVjdCB4PSI2MDAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRkY1NzMzIi8+CiAgPCEtLSBCb3R0b20gYmxvY2tzIC0tPgogIDxyZWN0IHg9IjgwMCIgeT0iNzAwIiB3aWR0aD0iMjUwIiBoZWlnaHQ9IjkzIiBmaWxsPSIjNzA4MDkwIi8+CiAgPHJlY3QgeD0iOTAwIiB5PSI2NTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTQzIiBmaWxsPSIjMzY0NTRGIi8+CiAgPHJlY3QgeD0iOTAwIiB5PSI3MDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iOTMiIGZpbGw9IiNGRjU3MzMiLz4KPC9zdmc+"
      },
      {
        "id": "tech-06",
        "name": "Synthwave Vector",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzRCMDA4MiIvPgogIDwhLS0gU3VuIC0tPgogIDxwYXRoIGQ9Ik0gNTYxIDMwMCBBIDIwMCAyMDAgMCAwIDEgNzYxIDUwMCBMIDM2MSA1MDAgQSAyMDAgMjAwIDAgMCAxIDU2MSAzMDAgWiIgZmlsbD0iI0ZGNjlCNCIvPgogIDxyZWN0IHg9IjMwMCIgeT0iNDAwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjNEIwMDgyIi8+CiAgPHJlY3QgeD0iMzAwIiB5PSI0MzAiIHdpZHRoPSI1MDAiIGhlaWdodD0iMTUiIGZpbGw9IiM0QjAwODIiLz4KICA8cmVjdCB4PSIzMDAiIHk9IjQ2MCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyNSIgZmlsbD0iIzRCMDA4MiIvPgogIDwhLS0gUGVyc3BlY3RpdmUgR3JpZCAtLT4KICA8cGF0aCBkPSJNIDAgNjAwIEwgMTEyMiA2MDAgTSAwIDY1MCBMIDExMjIgNjUwIE0gMCA3MjAgTCAxMTIyIDcyMCBNIDAgNzkzIEwgMTEyMiA3OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHBhdGggZD0iTSA1NjEgNTAwIEwgNTYxIDc5MyBNIDU2MSA1MDAgTCAyMDAgNzkzIE0gNTYxIDUwMCBMIC0xMDAgNzkzIE0gNTYxIDUwMCBMIDkyMiA3OTMgTSA1NjEgNTAwIEwgMTIyMiA3OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg=="
      },
      {
        "id": "tech-07",
        "name": "Pixel Art Interface",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMjIiIGhlaWdodD0iNjkzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxyZWN0IHg9IjUyIiB5PSI1MiIgd2lkdGg9IjEwMTgiIGhlaWdodD0iNDAiIGZpbGw9IiNEM0QzRDMiLz4KICA8cmVjdCB4PSI1MiIgeT0iOTIiIHdpZHRoPSIxMDE4IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAwMDAiLz4KICA8IS0tIFdpbmRvdyBjb250cm9scyAtLT4KICA8cmVjdCB4PSI5OTAiIHk9IjYyIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHJlY3QgeD0iMTAzMCIgeT0iNjIiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cGF0aCBkPSJNIDEwMzUgNjcgTCAxMDQ1IDc3IE0gMTA0NSA2NyBMIDEwMzUgNzciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPCEtLSBEZWNvciAtLT4KICA8cmVjdCB4PSI3MCIgeT0iNjYiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTIiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHJlY3QgeD0iODAiIHk9IjE1MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkYwMDAwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxyZWN0IHg9IjE0MCIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMEZGMDAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgPHJlY3QgeD0iMjAwIiB5PSIxNTAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzAwMDBGRiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjQiLz4KPC9zdmc+"
      },
      {
        "id": "tech-08",
        "name": "Sine Wave Dynamics",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzBEMTExNyIvPgogIDxwYXRoIGQ9Ik0gMCA2MDAgUSAyMDAgNTAwIDQwMCA2MDAgVCA4MDAgNjAwIFQgMTEyMiA2MDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRkZGRiIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPHBhdGggZD0iTSAwIDY1MCBRIDMwMCA0NTAgNjAwIDY1MCBUIDExMjIgNjUwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwRkYiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxwYXRoIGQ9Ik0gMCA3MDAgUSAxNTAgNzUwIDMwMCA3MDAgVCA2MDAgNzAwIFQgOTAwIDcwMCBUIDExMjIgNzAwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMEZGRkYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iMTAgNSIvPgo8L3N2Zz4="
      },
      {
        "id": "tech-09",
        "name": "Hexagonal Data Architecture",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgwMCwgMTAwKSI+CiAgICA8IS0tIEhleGFnb25zIHRvcCByaWdodCAtLT4KICAgIDxwb2x5Z29uIHBvaW50cz0iNjAsMCAxMjAsMzUgMTIwLDEwNSA2MCwxNDAgMCwxMDUgMCwzNSIgZmlsbD0iIzAwMDA4MCIgdHJhbnNmb3JtPSJzY2FsZSgwLjgpIHRyYW5zbGF0ZSgwLCAwKSIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI2MCwwIDEyMCwzNSAxMjAsMTA1IDYwLDE0MCAwLDEwNSAwLDM1IiBmaWxsPSIjNDE2OUUxIiB0cmFuc2Zvcm09InNjYWxlKDAuOCkgdHJhbnNsYXRlKDEzMCwgNzUpIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjYwLDAgMTIwLDM1IDEyMCwxMDUgNjAsMTQwIDAsMTA1IDAsMzUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDA4MCIgc3Ryb2tlLXdpZHRoPSI0IiB0cmFuc2Zvcm09InNjYWxlKDAuOCkgdHJhbnNsYXRlKC0xMzAsIDc1KSIvPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDUwMCkiPgogICAgPCEtLSBIZXhhZ29ucyBib3R0b20gbGVmdCAtLT4KICAgIDxwb2x5Z29uIHBvaW50cz0iNjAsMCAxMjAsMzUgMTIwLDEwNSA2MCwxNDAgMCwxMDUgMCwzNSIgZmlsbD0iIzQxNjlFMSIgdHJhbnNmb3JtPSJzY2FsZSgwLjgpIHRyYW5zbGF0ZSgwLCAwKSIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI2MCwwIDEyMCwzNSAxMjAsMTA1IDYwLDE0MCAwLDEwNSAwLDM1IiBmaWxsPSJub25lIiBzdHJva2U9IiM0MTY5RTEiIHN0cm9rZS13aWR0aD0iNCIgdHJhbnNmb3JtPSJzY2FsZSgwLjgpIHRyYW5zbGF0ZSgxMzAsIC03NSkiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNjAsMCAxMjAsMzUgMTIwLDEwNSA2MCwxNDAgMCwxMDUgMCwzNSIgZmlsbD0iIzAwMDA4MCIgdHJhbnNmb3JtPSJzY2FsZSgwLjgpIHRyYW5zbGF0ZSgxMzAsIDc1KSIvPgogIDwvZz4KPC9zdmc+"
      },
      {
        "id": "tech-10",
        "name": "Vector Glitch Art",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDwhLS0gR2xpdGNoIHNsaWNlcyBvbiB0aGUgbGVmdCAtLT4KICA8cG9seWdvbiBwb2ludHM9IjUwLDEwMCAxNTAsMTAwIDE1MCwyMDAgNTAsMjAwIiBmaWxsPSIjMDBGRkZGIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI4MCwxMjAgMT8wLDEyMCAxODAsMjIwIDgwLDIyMCIgZmlsbD0iI0ZGMDBGRiIvPgogIDxwb2x5Z29uIHBvaW50cz0iNjAsMTUwIDIwMCwxNTAgMjAwLDE4MCA2MCwxODAiIGZpbGw9IiNGRjAwMDAiLz4KICAKICA8cG9seWdvbiBwb2ludHM9IjIwLDQwMCAxMjAsNDAwIDEyMCw2MDAgMjAsNjAwIiBmaWxsPSIjRkYwMEZGIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIwLDQ1MCAxODAsNDUwIDE4MCw0ODAgMCw0ODAiIGZpbGw9IiMwMEZGRkYiLz4KICA8cG9seWdvbiBwb2ludHM9IjQwLDU1MCAxNDAsNTUwIDE0MCw1ODAgNDAsNTgwIiBmaWxsPSIjRkYwMDAwIi8+Cjwvc3ZnPg=="
      }
    ]
  },
  {
    "name": "Creative & Arts",
    "orientation": "landscape",
    "items": [
      {
        "id": "crea-01",
        "name": "De Stijl Geometric",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSI3OTMiIGZpbGw9IiNGRjAwMDAiLz4KICAgIDxyZWN0IHg9IjE1MCIgeT0iMCIgd2lkdGg9IjUwIiBoZWlnaHQ9Ijc5MyIgZmlsbD0iIzAwMDAwMCIvPgogICAgPHJlY3QgeD0iMTAwIiB5PSI2NTAiIHdpZHRoPSI5MDAiIGhlaWdodD0iODAiIGZpbGw9IiMwMDAwRkYiLz4KICAgIDxyZWN0IHg9IjI1MCIgeT0iODAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDAwMDAwIi8+CiAgPC9zdmc+"
      },
      {
        "id": "crea-02",
        "name": "Fluid Abstract Expressionism",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZGRjVFRSIvPgogICAgPHBhdGggZD0iTSAwIDQwMCBDIDMwMCAzMDAsIDYwMCA2MDAsIDExMjIgMjAwIEwgMTEyMiA3OTMgTCAwIDc5MyBaIiBmaWxsPSIjRkY3RjUwIiBvcGFjaXR5PSIwLjgiLz4KICAgIDxwYXRoIGQ9Ik0gMCA1MDAgQyA0MDAgMzAwLCA4MDAgNzAwLCAxMTIyIDQwMCBMIDExMjIgNzkzIEwgMCA3OTMgWiIgZmlsbD0iI0ZGREFCOSIgb3BhY2l0eT0iMC44Ii8+CiAgICA8cGF0aCBkPSJNIDAgNjAwIEMgNTAwIDQwMCwgNzAwIDgwMCwgMTEyMiA1MDAgTCAxMTIyIDc5MyBMIDAgNzkzIFoiIGZpbGw9IiNGRkQ3MDAiIG9wYWNpdHk9IjAuOCIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "crea-03",
        "name": "Memphis Milano 80s",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZBRkFGQSIvPgogICAgPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTUwIiByPSI4MCIgZmlsbD0iI0ZGMDBGRiIvPgogICAgPHJlY3QgeD0iODUwIiB5PSIxMDAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMDBGRkZGIiB0cmFuc2Zvcm09InJvdGF0ZSgzMCA5MTAgMTYwKSIvPgogICAgPHBhdGggZD0iTSA1MCA2NTAgUSAxNTAgNTUwIDI1MCA2NTAgVCA0NTAgNjUwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMTUiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iOTAwLDYwMCAxMDAwLDUwMCAxMDUwLDcwMCIgZmlsbD0iI0ZGRkYwMCIvPgogICAgPHBhdHRlcm4gaWQ9Im1lbWRvdHMiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjQiIGZpbGw9IiMwMDAwMDAiLz48L3BhdHRlcm4+CiAgICA8cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI21lbWRvdHMpIiBvcGFjaXR5PSIwLjIiLz4KICA8L3N2Zz4="
      },
      {
        "id": "crea-04",
        "name": "Boho Contemporary Abstract",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZBRjlGNiIvPgogICAgPHBhdGggZD0iTSAwIDAgTCA0MDAgMCBBIDQwMCA0MDAgMCAwIDEgMCA0MDAgWiIgZmlsbD0iI0UyNzI1QiIvPgogICAgPHBhdGggZD0iTSAxMTIyIDc5MyBMIDYyMiA3OTMgQSA1MDAgNTAwIDAgMCAxIDExMjIgMjkzIFoiIGZpbGw9IiM5REMxODMiLz4KICAgIDxjaXJjbGUgY3g9IjgwMCIgY3k9IjIwMCIgcj0iMTUwIiBmaWxsPSIjRkZEQjU4Ii8+CiAgICA8cGF0aCBkPSJNIDAgNzkzIEwgMzAwIDc5MyBBIDMwMCAzMDAgMCAwIDAgMCA0OTMgWiIgZmlsbD0iI0Y0QTQ2MCIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "crea-05",
        "name": "Editorial Color Blocking",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSI3OTMiIGZpbGw9IiMwMDAwMDAiLz4KICAgIDxyZWN0IHg9IjMwMCIgeT0iMCIgd2lkdGg9IjgyMiIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMwMDAwMDAiLz4KICAgIDxyZWN0IHg9IjI1MCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI0ZGMzM2NiIvPgogICAgPHJlY3QgeD0iNTAwIiB5PSI3MDAiIHdpZHRoPSI2MjIiIGhlaWdodD0iOTMiIGZpbGw9IiMwMDAwMDAiLz4KICA8L3N2Zz4="
      },
      {
        "id": "crea-06",
        "name": "Vector Paint Stroke Illusion",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBhdGggZD0iTSAwIDEwMCBRIDQwMCA1MCA2MDAgMjAwIFQgMTEyMiAxNTAgTCAxMTIyIDUwIEwgMCA1MCBaIiBmaWxsPSIjRkYxNDkzIi8+CiAgICA8cGF0aCBkPSJNIDAgMTMwIFEgMzAwIDEwMCA1MDAgMjUwIFQgMTEyMiAxODAgTCAxMTIyIDE1MCBRIDUwMCAyMjAgMzAwIDcwIFoiIGZpbGw9IiMwMEJGRkYiLz4KICAgIDxwYXRoIGQ9Ik0gMCA3OTMgTCAwIDY1MCBRIDUwMCA3NTAgODAwIDYwMCBUIDExMjIgNzAwIEwgMTEyMiA3OTMgWiIgZmlsbD0iI0ZGRDcwMCIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "crea-07",
        "name": "Continuous Monoline Art",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0Y1RjVEQyIvPgogICAgPHBhdGggZD0iTSA1MCA1MCBRIDE1MCA1MCAxNTAgMTUwIFQgMjUwIDE1MCBUIDI1MCAyNTAgVCAzNTAgMjUwIFQgMzUwIDM1MCBUIDQ1MCAzNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8cGF0aCBkPSJNIDEwNzIgNzQzIFEgOTcyIDc0MyA5NzIgNjQzIFQgODcyIDY0MyBUIDg3MiA1NDMgVCA3NzIgNTQzIFQgNzcyIDQ0MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxjaXJjbGUgY3g9IjU2MSIgY3k9IjM5Ni41IiByPSIzMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPC9zdmc+"
      },
      {
        "id": "crea-08",
        "name": "Stained Glass Geometric",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIwLDAgMjAwLDAgMTUwLDE1MCAwLDI1MCIgZmlsbD0iI0ZGMDA1NSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjUiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjAwLDAgNDAwLDAgMjUwLDIwMCAxNTAsMTUwIiBmaWxsPSIjMDA1NUZGIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNSIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI0MDAsMCA2MDAsMCA0NTAsMTUwIDI1MCwyMDAiIGZpbGw9IiNGRkREMDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI1Ii8+CiAgICA8cG9seWdvbiBwb2ludHM9IjAsMjUwIDE1MCwxNTAgMjUwLDIwMCAxMDAsNDAwIDAsNTAwIiBmaWxsPSIjMDBERDU1IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNSIvPgogICAgCiAgICA8cG9seWdvbiBwb2ludHM9IjExMjIsNzkzIDkyMiw3OTMgOTcyLDY0MyAxMTIyLDU0MyIgZmlsbD0iI0ZGMDA1NSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjUiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iOTIyLDc5MyA3MjIsNzkzIDg3Miw1OTMgOTcyLDY0MyIgZmlsbD0iIzAwNTVGRiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjUiLz4KICA8L3N2Zz4="
      },
      {
        "id": "crea-09",
        "name": "Op-Art Optical Illusion",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0gMCAxMDAgUSAyODAgMTUwIDU2MSAxMDAgVCAxMTIyIDEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNIDAgMTQwIFEgMjgwIDkwIDU2MSAxNDAgVCAxMTIyIDE0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjUiLz48cGF0aCBkPSJNIDAgMTgwIFEgMjgwIDIzMCA1NjEgMTgwIFQgMTEyMiAxODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTSAwIDIyMCBRIDI4MCAxNzAgNTYxIDIyMCBUIDExMjIgMjIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0gMCAyNjAgUSAyODAgMzEwIDU2MSAyNjAgVCAxMTIyIDI2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjUiLz48cGF0aCBkPSJNIDAgMzAwIFEgMjgwIDI1MCA1NjEgMzAwIFQgMTEyMiAzMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTSAwIDM0MCBRIDI4MCAzOTAgNTYxIDM0MCBUIDExMjIgMzQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0gMCAzODAgUSAyODAgMzMwIDU2MSAzODAgVCAxMTIyIDM4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjUiLz48cGF0aCBkPSJNIDAgNDIwIFEgMjgwIDQ3MCA1NjEgNDIwIFQgMTEyMiA0MjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTSAwIDQ2MCBRIDI4MCA0MTAgNTYxIDQ2MCBUIDExMjIgNDYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0gMCA1MDAgUSAyODAgNTUwIDU2MSA1MDAgVCAxMTIyIDUwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjUiLz48cGF0aCBkPSJNIDAgNTQwIFEgMjgwIDQ5MCA1NjEgNTQwIFQgMTEyMiA1NDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTSAwIDU4MCBRIDI4MCA2MzAgNTYxIDU4MCBUIDExMjIgNTgwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0gMCA2MjAgUSAyODAgNTcwIDU2MSA2MjAgVCAxMTIyIDYyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjUiLz48cGF0aCBkPSJNIDAgNjYwIFEgMjgwIDcxMCA1NjEgNjYwIFQgMTEyMiA2NjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PC9zdmc+"
      },
      {
        "id": "crea-10",
        "name": "Pop Art Halftone Vector",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBhdHRlcm4gaWQ9Imh0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjgiIGN5PSI4IiByPSI1IiBmaWxsPSIjMDAwIi8+PC9wYXR0ZXJuPgogICAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNodCkiIG9wYWNpdHk9IjAuMSIvPgogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjExMjIiIGhlaWdodD0iMTIwIiBmaWxsPSIjRkZGRjAwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iOCIvPgogICAgPHJlY3QgeD0iMCIgeT0iNjczIiB3aWR0aD0iMTEyMiIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNGRjAwRkYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI4Ii8+CiAgICA8cG9seWdvbiBwb2ludHM9IjUwLDEwMCAyMDAsMTAwIDI1MCwxNTAgMTAwLDE1MCIgZmlsbD0iIzAwRkZGRiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjYiLz4KICA8L3N2Zz4="
      }
    ]
  },
  {
    "name": "Luxury & Prestige",
    "orientation": "landscape",
    "items": [
      {
        "id": "lux-01",
        "name": "Art Deco Opulence",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzExMTExMSIvPgogICAgPHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMTA2MiIgaGVpZ2h0PSI3MzMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8cmVjdCB4PSI0MCIgeT0iNDAiIHdpZHRoPSIxMDQyIiBoZWlnaHQ9IjcxMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRDRBRjM3IiBzdHJva2Utd2lkdGg9IjMiLz4KICAgIDxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMjIiIGhlaWdodD0iNjkzIiBmaWxsPSJub25lIiBzdHJva2U9IiNENEFGMzciIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPCEtLSBDb3JuZXJzIC0tPgogICAgPHBhdGggZD0iTSA0MCAxMDAgTCAxMDAgNDAgTSA0MCAxMjAgTCAxMjAgNDAgTSAxMDgyIDEwMCBMIDEwMjIgNDAgTSAxMDgyIDEyMCBMIDEwMDIgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8cGF0aCBkPSJNIDQwIDY5MyBMIDEwMCA3NTMgTSA0MCA2NzMgTCAxMjAgNzUzIE0gMTA4MiA2OTMgTCAxMDIyIDc1MyBNIDEwODIgNjczIEwgMTAwMiA3NTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8IS0tIElubmVyIGRpYW1vbmQgYWNjZW50cyAtLT4KICAgIDxwb2x5Z29uIHBvaW50cz0iNzAsNzAgODUsNTUgMTAwLDcwIDg1LDg1IiBmaWxsPSIjRDRBRjM3Ii8+CiAgICA8cG9seWdvbiBwb2ludHM9IjEwNTIsNzAgMTA2Nyw1NSAxMDM3LDU1IDEwNTIsNzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q0QUYzNyIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "lux-02",
        "name": "High-Fashion Minimalism",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iNjAiIHk9IjYwIiB3aWR0aD0iMTAwMiIgaGVpZ2h0PSI2NzMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0I3NkU3OSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8cmVjdCB4PSI4MCIgeT0iODAiIHdpZHRoPSI5NjIiIGhlaWdodD0iNjMzIiBmaWxsPSJub25lIiBzdHJva2U9IiNCNzZFNzkiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgICA8bGluZSB4MT0iNTYxIiB5MT0iODAiIHgyPSI1NjEiIHkyPSIxMjAiIHN0cm9rZT0iI0I3NkU3OSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8bGluZSB4MT0iNTYxIiB5MT0iNjczIiB4Mj0iNTYxIiB5Mj0iNzEzIiBzdHJva2U9IiNCNzZFNzkiIHN0cm9rZS13aWR0aD0iMSIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "lux-03",
        "name": "Monoline Diamond Geometry",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzJDMzUzOSIvPgogICAgPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMTA0MiIgaGVpZ2h0PSI3MTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8cGF0dGVybiBpZD0iZGlhbW9uZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIyMCwwIDQwLDIwIDIwLDQwIDAsMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzRBNEE0QSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8L3BhdHRlcm4+CiAgICA8cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDIyIiBoZWlnaHQ9IjY5MyIgZmlsbD0idXJsKCNkaWFtb25kKSIvPgogICAgPHJlY3QgeD0iODAiIHk9IjgwIiB3aWR0aD0iOTYyIiBoZWlnaHQ9IjYzMyIgZmlsbD0iIzJDMzUzOSIgc3Ryb2tlPSIjRDRBRjM3IiBzdHJva2Utd2lkdGg9IjMiLz4KICA8L3N2Zz4="
      },
      {
        "id": "lux-04",
        "name": "Burgundy & Gold Regal",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzYwMDAxOCIvPgogICAgPHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMTAyMiIgaGVpZ2h0PSI2OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICA8cmVjdCB4PSI2MCIgeT0iNjAiIHdpZHRoPSIxMDAyIiBoZWlnaHQ9IjY3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDxwYXRoIGQ9Ik0gNTAgMTUwIFEgMTUwIDE1MCAxNTAgNTAgTSA1MCAxNjAgUSAxNjAgMTYwIDE2MCA1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxwYXRoIGQ9Ik0gMTA3MiAxNTAgUSA5NzIgMTUwIDk3MiA1MCBNIDEwNzIgMTYwIFEgOTYyIDE2MCA5NjIgNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8cGF0aCBkPSJNIDUwIDY0MyBRIDE1MCA2NDMgMTUwIDc0MyBNIDUwIDYzMyBRIDE2MCA2MzMgMTYwIDc0MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxwYXRoIGQ9Ik0gMTA3MiA2NDMgUSA5NzIgNjQzIDk3MiA3NDMgTSAxMDcyIDYzMyBRIDk2MiA2MzMgOTYyIDc0MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8L3N2Zz4="
      },
      {
        "id": "lux-05",
        "name": "Vector Marble Veining",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZBRkFGQSIvPgogICAgPHBhdGggZD0iTSAwIDIwMCBRIDMwMCAyNTAgNDAwIDEwMCBUIDgwMCAzMDAgVCAxMTIyIDI1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRThFOEU4IiBzdHJva2Utd2lkdGg9IjQiLz4KICAgIDxwYXRoIGQ9Ik0gMCA1MDAgUSAyMDAgNDAwIDQwMCA2MDAgVCA5MDAgNTAwIFQgMTEyMiA3MDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0U4RThFOCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICA8cGF0aCBkPSJNIDMwMCAwIFEgMzUwIDMwMCAyMDAgNTAwIFQgNDAwIDc5MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRjBGMEYwIiBzdHJva2Utd2lkdGg9IjUiLz4KICAgIDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEwNDIiIGhlaWdodD0iNzEzIiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTExMTEiIHN0cm9rZS13aWR0aD0iMyIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "lux-06",
        "name": "Concentric Golden Frame",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzBDMTQ0NSIvPgogICAgPHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMTA2MiIgaGVpZ2h0PSI3MzMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgICA8cmVjdCB4PSI0MCIgeT0iNDAiIHdpZHRoPSIxMDQyIiBoZWlnaHQ9IjcxMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRDRBRjM3IiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxyZWN0IHg9IjU1IiB5PSI1NSIgd2lkdGg9IjEwMTIiIGhlaWdodD0iNjgzIiBmaWxsPSJub25lIiBzdHJva2U9IiNENEFGMzciIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPHJlY3QgeD0iNzUiIHk9Ijc1IiB3aWR0aD0iOTcyIiBoZWlnaHQ9IjY0MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRDRBRjM3IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogICAgPHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSI5MjIiIGhlaWdodD0iNTkzIiBmaWxsPSJub25lIiBzdHJva2U9IiNENEFGMzciIHN0cm9rZS13aWR0aD0iMC4yNSIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "lux-07",
        "name": "Scalloped Art Nouveau",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0gNDAgNDAgUSA2MCAyMCA4MCA0MCBRIDEwMCAyMCAxMjAgNDAgUSAxNDAgMjAgMTYwIDQwIFEgMTgwIDIwIDIwMCA0MCBRIDIyMCAyMCAyNDAgNDAgUSAyNjAgMjAgMjgwIDQwIFEgMzAwIDIwIDMyMCA0MCBRIDM0MCAyMCAzNjAgNDAgUSAzODAgMjAgNDAwIDQwIFEgNDIwIDIwIDQ0MCA0MCBRIDQ2MCAyMCA0ODAgNDAgUSA1MDAgMjAgNTIwIDQwIFEgNTQwIDIwIDU2MCA0MCBRIDU4MCAyMCA2MDAgNDAgUSA2MjAgMjAgNjQwIDQwIFEgNjYwIDIwIDY4MCA0MCBRIDcwMCAyMCA3MjAgNDAgUSA3NDAgMjAgNzYwIDQwIFEgNzgwIDIwIDgwMCA0MCBRIDgyMCAyMCA4NDAgNDAgUSA4NjAgMjAgODgwIDQwIFEgOTAwIDIwIDkyMCA0MCBRIDk0MCAyMCA5NjAgNDAgUSA5ODAgMjAgMTAwMCA0MCBRIDEwMjAgMjAgMTA0MCA0MCBRIDEwNjAgMjAgMTA4MCA0MCBRIDExMDAgMjAgMTEyMCA0MCBRIDExMDIgNjAgMTA4MiA4MCBRIDExMDIgMTAwIDEwODIgMTIwIFEgMTEwMiAxNDAgMTA4MiAxNjAgUSAxMTAyIDE4MCAxMDgyIDIwMCBRIDExMDIgMjIwIDEwODIgMjQwIFEgMTEwMiAyNjAgMTA4MiAyODAgUSAxMTAyIDMwMCAxMDgyIDMyMCBRIDExMDIgMzQwIDEwODIgMzYwIFEgMTEwMiAzODAgMTA4MiA0MDAgUSAxMTAyIDQyMCAxMDgyIDQ0MCBRIDExMDIgNDYwIDEwODIgNDgwIFEgMTEwMiA1MDAgMTA4MiA1MjAgUSAxMTAyIDU0MCAxMDgyIDU2MCBRIDExMDIgNTgwIDEwODIgNjAwIFEgMTEwMiA2MjAgMTA4MiA2NDAgUSAxMTAyIDY2MCAxMDgyIDY4MCBRIDExMDIgNzAwIDEwODIgNzIwIFEgMTEwMiA3NDAgMTA4MiA3NjAgUSAxMDYyIDc3MyAxMDQyIDc1MyBRIDEwMjIgNzczIDEwMDIgNzUzIFEgOTgyIDc3MyA5NjIgNzUzIFEgOTQyIDc3MyA5MjIgNzUzIFEgOTAyIDc3MyA4ODIgNzUzIFEgODYyIDc3MyA4NDIgNzUzIFEgODIyIDc3MyA4MDIgNzUzIFEgNzgyIDc3MyA3NjIgNzUzIFEgNzQyIDc3MyA3MjIgNzUzIFEgNzAyIDc3MyA2ODIgNzUzIFEgNjYyIDc3MyA2NDIgNzUzIFEgNjIyIDc3MyA2MDIgNzUzIFEgNTgyIDc3MyA1NjIgNzUzIFEgNTQyIDc3MyA1MjIgNzUzIFEgNTAyIDc3MyA0ODIgNzUzIFEgNDYyIDc3MyA0NDIgNzUzIFEgNDIyIDc3MyA0MDIgNzUzIFEgMzgyIDc3MyAzNjIgNzUzIFEgMzQyIDc3MyAzMjIgNzUzIFEgMzAyIDc3MyAyODIgNzUzIFEgMjYyIDc3MyAyNDIgNzUzIFEgMjIyIDc3MyAyMDIgNzUzIFEgMTgyIDc3MyAxNjIgNzUzIFEgMTQyIDc3MyAxMjIgNzUzIFEgMTAyIDc3MyA4MiA3NTMgUSA2MiA3NzMgNDIgNzUzIFEgMjIgNzczIDIgNzUzIFEgMjAgNzMzIDQwIDcxMyBRIDIwIDY5MyA0MCA2NzMgUSAyMCA2NTMgNDAgNjMzIFEgMjAgNjEzIDQwIDU5MyBRIDIwIDU3MyA0MCA1NTMgUSAyMCA1MzMgNDAgNTEzIFEgMjAgNDkzIDQwIDQ3MyBRIDIwIDQ1MyA0MCA0MzMgUSAyMCA0MTMgNDAgMzkzIFEgMjAgMzczIDQwIDM1MyBRIDIwIDMzMyA0MCAzMTMgUSAyMCAyOTMgNDAgMjczIFEgMjAgMjUzIDQwIDIzMyBRIDIwIDIxMyA0MCAxOTMgUSAyMCAxNzMgNDAgMTUzIFEgMjAgMTMzIDQwIDExMyBRIDIwIDkzIDQwIDczIFEgMjAgNTMgNDAgMzMgIiBmaWxsPSJub25lIiBzdHJva2U9IiNFNUQwOEYiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
      },
      {
        "id": "lux-08",
        "name": "Guilloche Excellence",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFBMUExQSIvPjxnIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDEwMCAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDEwMjIgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDEwMCA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDEwMjIgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSAxMDAgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTUgMTAyMiAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDE1IDEwMCA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSAxMDIyIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMzAgMTAwIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDMwIDEwMjIgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgzMCAxMDAgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMzAgMTAyMiA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDQ1IDEwMCAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSg0NSAxMDIyIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoNDUgMTAwIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDQ1IDEwMjIgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSg2MCAxMDAgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoNjAgMTAyMiAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDYwIDEwMCA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSg2MCAxMDIyIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoNzUgMTAwIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDc1IDEwMjIgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSg3NSAxMDAgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoNzUgMTAyMiA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDkwIDEwMCAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSg5MCAxMDIyIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoOTAgMTAwIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDkwIDEwMjIgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxMDUgMTAwIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDEwNSAxMDIyIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTA1IDEwMCA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxMDUgMTAyMiA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDEyMCAxMDAgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTIwIDEwMjIgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjAgMTAwIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDEyMCAxMDIyIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IDEwMCAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxMzUgMTAyMiAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDEzNSAxMDAgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IDEwMjIgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNTAgMTAwIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDE1MCAxMDIyIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTUwIDEwMCA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNTAgMTAyMiA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDE2NSAxMDAgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTY1IDEwMjIgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNjUgMTAwIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDE2NSAxMDIyIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDEwMCAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxODAgMTAyMiAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDE4MCAxMDAgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDEwMjIgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxOTUgMTAwIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDE5NSAxMDIyIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTk1IDEwMCA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgxOTUgMTAyMiA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDIxMCAxMDAgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMjEwIDEwMjIgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgyMTAgMTAwIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDIxMCAxMDIyIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMjI1IDEwMCAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgyMjUgMTAyMiAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDIyNSAxMDAgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMjI1IDEwMjIgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgyNDAgMTAwIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDI0MCAxMDIyIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMjQwIDEwMCA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgyNDAgMTAyMiA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDI1NSAxMDAgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMjU1IDEwMjIgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgyNTUgMTAwIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDI1NSAxMDIyIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMjcwIDEwMCAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgyNzAgMTAyMiAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDI3MCAxMDAgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMjcwIDEwMjIgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgyODUgMTAwIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDI4NSAxMDIyIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMjg1IDEwMCA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgyODUgMTAyMiA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDMwMCAxMDAgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMzAwIDEwMjIgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgzMDAgMTAwIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDMwMCAxMDIyIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMzE1IDEwMCAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgzMTUgMTAyMiAxMDApIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDMxNSAxMDAgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMzE1IDEwMjIgNjkzKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgzMzAgMTAwIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDMzMCAxMDIyIDEwMCkiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNjkzIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMzMwIDEwMCA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMjIiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgzMzAgMTAyMiA2OTMpIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDM0NSAxMDAgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDIyIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoMzQ1IDEwMjIgMTAwKSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSI2OTMiIHJ4PSI2MCIgcnk9IjIwIiB0cmFuc2Zvcm09InJvdGF0ZSgzNDUgMTAwIDY5MykiLz48ZWxsaXBzZSBjeD0iMTAyMiIgY3k9IjY5MyIgcng9IjYwIiByeT0iMjAiIHRyYW5zZm9ybT0icm90YXRlKDM0NSAxMDIyIDY5MykiLz48L2c+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSI5MjIiIGhlaWdodD0iNTkzIiBmaWxsPSJub25lIiBzdHJva2U9IiNENEFGMzciIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9IjkwIiB5PSI5MCIgd2lkdGg9Ijk0MiIgaGVpZ2h0PSI2MTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4="
      },
      {
        "id": "lux-09",
        "name": "Foil Stamp Vector Illusion",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMTAyMiIgaGVpZ2h0PSI2OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0RBQTUyMCIgc3Ryb2tlLXdpZHRoPSIxMCIvPgogICAgPHJlY3QgeD0iNjIiIHk9IjYyIiB3aWR0aD0iOTk4IiBoZWlnaHQ9IjY2OSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQjg4NjBCIiBzdHJva2Utd2lkdGg9IjQiLz4KICAgIDxyZWN0IHg9IjcwIiB5PSI3MCIgd2lkdGg9Ijk4MiIgaGVpZ2h0PSI2NTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRjhEQyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyNSIgZmlsbD0iI0RBQTUyMCIvPgogICAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMTUiIGZpbGw9IiNCODg2MEIiLz4KICAgIDxjaXJjbGUgY3g9IjEwNzIiIGN5PSI1MCIgcj0iMjUiIGZpbGw9IiNEQUE1MjAiLz4KICAgIDxjaXJjbGUgY3g9IjEwNzIiIGN5PSI1MCIgcj0iMTUiIGZpbGw9IiNCODg2MEIiLz4KICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNzQzIiByPSIyNSIgZmlsbD0iI0RBQTUyMCIvPgogICAgPGNpcmNsZSBjeD0iNTAiIGN5PSI3NDMiIHI9IjE1IiBmaWxsPSIjQjg4NjBCIi8+CiAgICA8Y2lyY2xlIGN4PSIxMDcyIiBjeT0iNzQzIiByPSIyNSIgZmlsbD0iI0RBQTUyMCIvPgogICAgPGNpcmNsZSBjeD0iMTA3MiIgY3k9Ijc0MyIgcj0iMTUiIGZpbGw9IiNCODg2MEIiLz4KICA8L3N2Zz4="
      },
      {
        "id": "lux-10",
        "name": "The Obsidian Monolith",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzA1MDUwNSIvPgogICAgPHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iMTA5MiIgaGVpZ2h0PSI3NjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8cmVjdCB4PSIyNSIgeT0iMjUiIHdpZHRoPSIxMDcyIiBoZWlnaHQ9Ijc0MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC41Ii8+CiAgICA8Y2lyY2xlIGN4PSI1NjEiIGN5PSI3NDMiIHI9IjQwIiBmaWxsPSIjMDUwNTA1IiBzdHJva2U9IiNGRkQ3MDAiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPGNpcmNsZSBjeD0iNTYxIiBjeT0iNzQzIiByPSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDwvc3ZnPg=="
      }
    ]
  },
  {
    "name": "Sports & Athletics",
    "orientation": "landscape",
    "items": [
      {
        "id": "sport-01",
        "name": "Kinetic Chevron Vectors",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIwLDAgMjUwLDAgNDUwLDM5Ni41IDI1MCw3OTMgMCw3OTMgMjAwLDM5Ni41IiBmaWxsPSIjRTMyNjM2Ii8+CiAgICA8cG9seWdvbiBwb2ludHM9IjI4MCwwIDQ4MCwwIDY4MCwzOTYuNSA0ODAsNzkzIDI4MCw3OTMgNDgwLDM5Ni41IiBmaWxsPSIjMDAwMDgwIiBvcGFjaXR5PSIwLjgiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNTEwLDAgNjEwLDAgODEwLDM5Ni41IDYxMCw3OTMgNTEwLDc5MyA3MTAsMzk2LjUiIGZpbGw9IiNFMzI2MzYiIG9wYWNpdHk9IjAuNSIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "sport-02",
        "name": "Velocity Speed Lines",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0Y1RjVGNSIvPgogICAgPGcgZmlsbD0iI0ZGNDUwMCI+CiAgICAgIDxyZWN0IHg9IjAiIHk9IjEwMCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSIyMCIgdHJhbnNmb3JtPSJza2V3WCgtNDUpIi8+CiAgICAgIDxyZWN0IHg9IjAiIHk9IjE0MCIgd2lkdGg9IjQ1MCIgaGVpZ2h0PSIxNSIgdHJhbnNmb3JtPSJza2V3WCgtNDUpIi8+CiAgICAgIDxyZWN0IHg9IjAiIHk9IjE3NSIgd2lkdGg9IjgwMCIgaGVpZ2h0PSIyNSIgdHJhbnNmb3JtPSJza2V3WCgtNDUpIi8+CiAgICAgIDxyZWN0IHg9IjAiIHk9IjYwMCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSIyNSIgdHJhbnNmb3JtPSJza2V3WCgtNDUpIi8+CiAgICAgIDxyZWN0IHg9IjAiIHk9IjY0NSIgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxNSIgdHJhbnNmb3JtPSJza2V3WCgtNDUpIi8+CiAgICA8L2c+CiAgICA8ZyBmaWxsPSIjMTExMTExIj4KICAgICAgPHJlY3QgeD0iMCIgeT0iMTE1IiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjEwIiB0cmFuc2Zvcm09InNrZXdYKC00NSkiLz4KICAgICAgPHJlY3QgeD0iMCIgeT0iMTYwIiB3aWR0aD0iNzUwIiBoZWlnaHQ9IjEwIiB0cmFuc2Zvcm09InNrZXdYKC00NSkiLz4KICAgICAgPHJlY3QgeD0iMCIgeT0iNjE1IiB3aWR0aD0iODUwIiBoZWlnaHQ9IjEwIiB0cmFuc2Zvcm09InNrZXdYKC00NSkiLz4KICAgIDwvZz4KICA8L3N2Zz4="
      },
      {
        "id": "sport-03",
        "name": "Diagonal Power Blocks",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIwLDc5MyA1MDAsNzkzIDgwMCwwIDMwMCwwIiBmaWxsPSIjMUMxQzFDIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjU1MCw3OTMgNjUwLDc5MyA5NTAsMCA4NTAsMCIgZmlsbD0iIzM5RkYxNCIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI3MDAsNzkzIDc1MCw3OTMgMTA1MCwwIDEwMDAsMCIgZmlsbD0iIzFDMUMxQyIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "sport-04",
        "name": "Track & Field Curves",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBhdGggZD0iTSAzMDAgMTUwIEEgMjQ2LjUgMjQ2LjUgMCAwIDAgMzAwIDY0MyBMIDgyMiA2NDMgQSAyNDYuNSAyNDYuNSAwIDAgMCA4MjIgMTUwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0QzMkYyRiIgc3Ryb2tlLXdpZHRoPSI0MCIvPgogICAgPHBhdGggZD0iTSAzMDAgMTUwIEEgMjQ2LjUgMjQ2LjUgMCAwIDAgMzAwIDY0MyBMIDgyMiA2NDMgQSAyNDYuNSAyNDYuNSAwIDAgMCA4MjIgMTUwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSIyMCAyMCIvPgogICAgPHBhdGggZD0iTSAzMDAgMTEwIEEgMjg2LjUgMjg2LjUgMCAwIDAgMzAwIDY4MyBMIDgyMiA2ODMgQSAyODYuNSAyODYuNSAwIDAgMCA4MjIgMTEwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0QzMkYyRiIgc3Ryb2tlLXdpZHRoPSIxMCIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "sport-05",
        "name": "Sports Tech Hex-Mesh",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBhdHRlcm4gaWQ9ImhleCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjUxLjk2IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBwYXR0ZXJuVHJhbnNmb3JtPSJzY2FsZSgxLjUpIj4KICAgICAgPHBhdGggZD0iTSAxNSAwIEwgMzAgOC42NiBMIDMwIDI1Ljk4IEwgMTUgMzQuNjQgTCAwIDI1Ljk4IEwgMCA4LjY2IFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRkYwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8L3BhdHRlcm4+CiAgICA8cG9seWdvbiBwb2ludHM9IjAsMCA0MDAsMCAwLDQwMCIgZmlsbD0iIzAwMUYzRiIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIxMTIyLDc5MyA3MjIsNzkzIDExMjIsMzkzIiBmaWxsPSIjMDAxRjNGIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjAsMCA0MDAsMCAwLDQwMCIgZmlsbD0idXJsKCNoZXgpIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjExMjIsNzkzIDcyMiw3OTMgMTEyMiwzOTMiIGZpbGw9InVybCgjaGV4KSIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "sport-06",
        "name": "Sweeping Nike-esque Swoosh",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBhdGggZD0iTSAtMTAwIDcwMCBRIDMwMCA5MDAgMTIwMCA0MDAgTCAxMjAwIDc5MyBMIC0xMDAgNzkzIFoiIGZpbGw9IiMwMDAwODAiLz4KICAgIDxwYXRoIGQ9Ik0gLTEwMCA2NTAgUSA0MDAgOTUwIDEyMDAgMzUwIEwgMTIwMCA0MDAgUSAzMDAgOTAwIC0xMDAgNzAwIFoiIGZpbGw9IiNGRkQ3MDAiLz4KICA8L3N2Zz4="
      },
      {
        "id": "sport-07",
        "name": "Geometric Star Integration",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMTAyMiIgaGVpZ2h0PSI2OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0U1MzkzNSIgc3Ryb2tlLXdpZHRoPSIxMiIvPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTAsIDUwKSBzY2FsZSgxLjUpIj4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIwLC0yMCA1Ljg4LC02LjE4IDE5LjAyLC02LjE4IDguNTcsMi4zNSAxMi4zNiwxNi4xOCAwLDguNTMgLTEyLjM2LDE2LjE4IC04LjU3LDIuMzUgLTE5LjAyLC02LjE4IC01Ljg4LC02LjE4IiBmaWxsPSIjMUU4OEU1Ii8+CiAgICA8L2c+CiAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDcyLCA1MCkgc2NhbGUoMS41KSI+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iMCwtMjAgNS44OCwtNi4xOCAxOS4wMiwtNi4xOCA4LjU3LDIuMzUgMTIuMzYsMTYuMTggMCw4LjUzIC0xMi4zNiwxNi4xOCAtOC41NywyLjM1IC0xOS4wMiwtNi4xOCAtNS44OCwtNi4xOCIgZmlsbD0iIzFFODhFNSIvPgogICAgPC9nPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTYxLCA3NDMpIHNjYWxlKDIpIj4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIwLC0yMCA1Ljg4LC02LjE4IDE5LjAyLC02LjE4IDguNTcsMi4zNSAxMi4zNiwxNi4xOCAwLDguNTMgLTEyLjM2LDE2LjE4IC04LjU3LDIuMzUgLTE5LjAyLC02LjE4IC01Ljg4LC02LjE4IiBmaWxsPSIjRkZCMzAwIi8+CiAgICA8L2c+CiAgPC9zdmc+"
      },
      {
        "id": "sport-08",
        "name": "Extreme Sports Triangles",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIwLDAgNDAwLDAgMjAwLDIwMCIgZmlsbD0iIzExMSIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI0MDAsMCA3MDAsMCA1NTAsMzAwIiBmaWxsPSIjMzlGRjE0Ii8+CiAgICA8cG9seWdvbiBwb2ludHM9IjcwMCwwIDExMjIsMCA5MDAsMjUwIiBmaWxsPSIjMTExIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjAsNzkzIDMwMCw3OTMgMTUwLDU1MCIgZmlsbD0iIzM5RkYxNCIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIzMDAsNzkzIDgwMCw3OTMgNTUwLDQ1MCIgZmlsbD0iIzExMSIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI4MDAsNzkzIDExMjIsNzkzIDEwMDAsNjAwIiBmaWxsPSIjMzlGRjE0Ii8+CiAgPC9zdmc+"
      },
      {
        "id": "sport-09",
        "name": "Synthwave Cyber Athletics",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFhMGIyZSIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTBiMmUiLz48cGF0aCBkPSJNIDU2MSAzNTAgQSAxNTAgMTUwIDAgMCAxIDcxMSA1MDAgTCA0MTEgNTAwIEEgMTUwIDE1MCAwIDAgMSA1NjEgMzUwIFoiIGZpbGw9InVybCgjc3VuR3JhZCkiLz48Y2xpcFBhdGggaWQ9InN1bkNsaXAiPjxwYXRoIGQ9Ik0gNTYxIDI1MCBBIDIwMCAyMDAgMCAwIDEgNzYxIDQ1MCBMIDM2MSA0NTAgQSAyMDAgMjAwIDAgMCAxIDU2MSAyNTAgWiIvPjwvY2xpcFBhdGg+PGcgY2xpcC1wYXRoPSJ1cmwoI3N1bkNsaXApIj48cmVjdCB4PSIzMDAiIHk9IjI1MCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRjAwN0YiLz48cmVjdCB4PSIzMDAiIHk9IjM1MCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSI1IiBmaWxsPSIjMWEwYjJlIi8+PHJlY3QgeD0iMzAwIiB5PSIzNjUiIHdpZHRoPSI1MDAiIGhlaWdodD0iNyIgZmlsbD0iIzFhMGIyZSIvPjxyZWN0IHg9IjMwMCIgeT0iMzgwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjkiIGZpbGw9IiMxYTBiMmUiLz48cmVjdCB4PSIzMDAiIHk9IjM5NSIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIxMSIgZmlsbD0iIzFhMGIyZSIvPjxyZWN0IHg9IjMwMCIgeT0iNDEwIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjEzIiBmaWxsPSIjMWEwYjJlIi8+PHJlY3QgeD0iMzAwIiB5PSI0MjUiIHdpZHRoPSI1MDAiIGhlaWdodD0iMTUiIGZpbGw9IiMxYTBiMmUiLz48cmVjdCB4PSIzMDAiIHk9IjQ0MCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIxNyIgZmlsbD0iIzFhMGIyZSIvPjxyZWN0IHg9IjMwMCIgeT0iNDU1IiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjE5IiBmaWxsPSIjMWEwYjJlIi8+PHJlY3QgeD0iMzAwIiB5PSI0NzAiIHdpZHRoPSI1MDAiIGhlaWdodD0iMjEiIGZpbGw9IiMxYTBiMmUiLz48cmVjdCB4PSIzMDAiIHk9IjQ4NSIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMyIgZmlsbD0iIzFhMGIyZSIvPjwvZz48cGF0aCBkPSJNIDAgNTAwIEwgMTEyMiA1MDAgTSAwIDU1MCBMIDExMjIgNTUwIE0gMCA2MjAgTCAxMTIyIDYyMCBNIDAgNzEwIEwgMTEyMiA3MTAgTSAwIDgyMCBMIDExMjIgODIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMEYwRkYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI1NjEiIHkxPSI1MDAiIHgyPSItOTM5IiB5Mj0iODUwIiBzdHJva2U9IiMwMEYwRkYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI1NjEiIHkxPSI1MDAiIHgyPSItNjM5IiB5Mj0iODUwIiBzdHJva2U9IiMwMEYwRkYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI1NjEiIHkxPSI1MDAiIHgyPSItMzM5IiB5Mj0iODUwIiBzdHJva2U9IiMwMEYwRkYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI1NjEiIHkxPSI1MDAiIHgyPSItMzkiIHkyPSI4NTAiIHN0cm9rZT0iIzAwRjBGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjU2MSIgeTE9IjUwMCIgeDI9IjI2MSIgeTI9Ijg1MCIgc3Ryb2tlPSIjMDBGMEZGIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iNTYxIiB5MT0iNTAwIiB4Mj0iNTYxIiB5Mj0iODUwIiBzdHJva2U9IiMwMEYwRkYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI1NjEiIHkxPSI1MDAiIHgyPSI4NjEiIHkyPSI4NTAiIHN0cm9rZT0iIzAwRjBGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjU2MSIgeTE9IjUwMCIgeDI9IjExNjEiIHkyPSI4NTAiIHN0cm9rZT0iIzAwRjBGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjU2MSIgeTE9IjUwMCIgeDI9IjE0NjEiIHkyPSI4NTAiIHN0cm9rZT0iIzAwRjBGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjU2MSIgeTE9IjUwMCIgeDI9IjE3NjEiIHkyPSI4NTAiIHN0cm9rZT0iIzAwRjBGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjU2MSIgeTE9IjUwMCIgeDI9IjIwNjEiIHkyPSI4NTAiIHN0cm9rZT0iIzAwRjBGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+"
      },
      {
        "id": "sport-10",
        "name": "Varsity Letterman Stripes",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjExMjIiIGhlaWdodD0iNjAiIGZpbGw9IiMwMDIzNjYiLz4KICAgIDxyZWN0IHg9IjAiIHk9IjYwIiB3aWR0aD0iMTEyMiIgaGVpZ2h0PSIyMCIgZmlsbD0iI0ZGQzAwMCIvPgogICAgPHJlY3QgeD0iMCIgeT0iODAiIHdpZHRoPSIxMTIyIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMDAyMzY2Ii8+CiAgICAKICAgIDxyZWN0IHg9IjAiIHk9IjczMyIgd2lkdGg9IjExMjIiIGhlaWdodD0iNjAiIGZpbGw9IiMwMDIzNjYiLz4KICAgIDxyZWN0IHg9IjAiIHk9IjcxMyIgd2lkdGg9IjExMjIiIGhlaWdodD0iMjAiIGZpbGw9IiNGRkMwMDAiLz4KICAgIDxyZWN0IHg9IjAiIHk9IjcwMyIgd2lkdGg9IjExMjIiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDIzNjYiLz4KICAgIAogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYwIiBoZWlnaHQ9Ijc5MyIgZmlsbD0iIzAwMjM2NiIvPgogICAgPHJlY3QgeD0iNjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI3OTMiIGZpbGw9IiNGRkMwMDAiLz4KICAgIDxyZWN0IHg9IjgwIiB5PSIwIiB3aWR0aD0iMTAiIGhlaWdodD0iNzkzIiBmaWxsPSIjMDAyMzY2Ii8+CiAgICAKICAgIDxyZWN0IHg9IjEwNjIiIHk9IjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI3OTMiIGZpbGw9IiMwMDIzNjYiLz4KICAgIDxyZWN0IHg9IjEwNDIiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI3OTMiIGZpbGw9IiNGRkMwMDAiLz4KICAgIDxyZWN0IHg9IjEwMzIiIHk9IjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSI3OTMiIGZpbGw9IiMwMDIzNjYiLz4KICA8L3N2Zz4="
      }
    ]
  },
  {
    "name": "Medical & Healthcare",
    "orientation": "landscape",
    "items": [
      {
        "id": "med-01",
        "name": "Clinical Swiss Minimalism",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZBRkFGQSIvPgogICAgPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMTA0MiIgaGVpZ2h0PSI3MTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0UwRTBFMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8cGF0aCBkPSJNIDYwIDgwIEwgMTAwIDgwIE0gODAgNjAgTCA4MCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzREQjZBQyIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+CiAgICA8cGF0aCBkPSJNIDEwMjIgNzEzIEwgMTA2MiA3MTMgTSAxMDQyIDY5MyBMIDEwNDIgNzMzIiBmaWxsPSJub25lIiBzdHJva2U9IiM0REI2QUMiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "med-02",
        "name": "Biophilic Healing Curves",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBhdGggZD0iTSAwIDc5MyBMIDAgNjAwIEMgMzAwIDUwMCwgNjAwIDc1MCwgMTEyMiA2NTAgTCAxMTIyIDc5MyBaIiBmaWxsPSIjQjJERkRCIi8+CiAgICA8cGF0aCBkPSJNIDAgNzkzIEwgMCA2NTAgQyA0MDAgNTUwLCA4MDAgODAwLCAxMTIyIDcwMCBMIDExMjIgNzkzIFoiIGZpbGw9IiNFMEYyRjEiLz4KICAgIDxwYXRoIGQ9Ik0gMCA3OTMgTCAwIDcwMCBDIDUwMCA2NTAsIDkwMCA4NTAsIDExMjIgNzUwIEwgMTEyMiA3OTMgWiIgZmlsbD0iIzgwQ0JDNCIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "med-03",
        "name": "Vector EKG Rhythm Line",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iMCIgeT0iNjUwIiB3aWR0aD0iMTEyMiIgaGVpZ2h0PSIxNDMiIGZpbGw9IiNGNUY1RjUiLz4KICAgIDxwb2x5bGluZSBwb2ludHM9IjUwLDY1MCAyMDAsNjUwIDIyMCw2MjAgMjQwLDcwMCAyNjAsNTUwIDI4MCw2ODAgMzAwLDY1MCAxMDcyLDY1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRTUzOTM1IiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICAgIDxwb2x5bGluZSBwb2ludHM9IjAsNjUwIDUwLDY1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRTUzOTM1IiBzdHJva2Utd2lkdGg9IjQiLz4KICA8L3N2Zz4="
      },
      {
        "id": "med-04",
        "name": "Sterile Geometric Capsule",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMTA0MiIgaGVpZ2h0PSI3MTMiIHJ4PSIxNTAiIHJ5PSIxNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwOTY4OCIgc3Ryb2tlLXdpZHRoPSIxMiIvPgogICAgPHJlY3QgeD0iNjAiIHk9IjYwIiB3aWR0aD0iMTAwMiIgaGVpZ2h0PSI2NzMiIHJ4PSIxMzAiIHJ5PSIxMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0UwRTBFMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgPC9zdmc+"
      },
      {
        "id": "med-05",
        "name": "Stylized DNA Helix",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBhdGggZD0iTSAxMDAgMCBDIDIwMCAxNTAsIDAgMjUwLCAxMDAgNDAwIEMgMjAwIDU1MCwgMCA2NTAsIDEwMCA3OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE5NzZEMiIgc3Ryb2tlLXdpZHRoPSIxMCIvPgogICAgPHBhdGggZD0iTSAxMDAgMCBDIDAgMTUwLCAyMDAgMjUwLCAxMDAgNDAwIEMgMCA1NTAsIDIwMCA2NTAsIDEwMCA3OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0QjVGNiIgc3Ryb2tlLXdpZHRoPSIxMCIvPgogICAgPGxpbmUgeDE9IjYwIiB5MT0iMTAwIiB4Mj0iMTQwIiB5Mj0iMTAwIiBzdHJva2U9IiNCQkRFRkIiIHN0cm9rZS13aWR0aD0iNiIvPgogICAgPGxpbmUgeDE9IjU1IiB5MT0iMzAwIiB4Mj0iMTQ1IiB5Mj0iMzAwIiBzdHJva2U9IiNCQkRFRkIiIHN0cm9rZS13aWR0aD0iNiIvPgogICAgPGxpbmUgeDE9IjYwIiB5MT0iNTAwIiB4Mj0iMTQwIiB5Mj0iNTAwIiBzdHJva2U9IiNCQkRFRkIiIHN0cm9rZS13aWR0aD0iNiIvPgogICAgPGxpbmUgeDE9IjU1IiB5MT0iNzAwIiB4Mj0iMTQ1IiB5Mj0iNzAwIiBzdHJva2U9IiNCQkRFRkIiIHN0cm9rZS13aWR0aD0iNiIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "med-06",
        "name": "Pharmaceutical Color Blocks",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iODAiIHk9IjcwMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI2MCIgcng9IjMwIiByeT0iMzAiIGZpbGw9IiNCM0U1RkMiLz4KICAgIDxyZWN0IHg9IjI2MCIgeT0iNzAwIiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjYwIiByeD0iMzAiIHJ5PSIzMCIgZmlsbD0iIzgxRDRGQSIvPgogICAgPHJlY3QgeD0iNTAwIiB5PSI3MDAiIHdpZHRoPSIxNDAiIGhlaWdodD0iNjAiIHJ4PSIzMCIgcnk9IjMwIiBmaWxsPSIjNEZDM0Y3Ii8+CiAgICA8cmVjdCB4PSI2NjAiIHk9IjcwMCIgd2lkdGg9IjI4MCIgaGVpZ2h0PSI2MCIgcng9IjMwIiByeT0iMzAiIGZpbGw9IiMyOUI2RjYiLz4KICAgIDxyZWN0IHg9Ijk2MCIgeT0iNzAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiByeD0iMzAiIHJ5PSIzMCIgZmlsbD0iIzAzQTlGNCIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "med-07",
        "name": "Minimalist Caduceus Emblem",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZBRkFGQSIvPgogICAgPHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMTAyMiIgaGVpZ2h0PSI2OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM3NDc0RiIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICA8Y2lyY2xlIGN4PSI1NjEiIGN5PSIxNTAiIHI9IjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzNzQ3NEYiIHN0cm9rZS13aWR0aD0iNSIvPgogICAgPHBhdGggZD0iTSA1NjEgMTEwIEwgNTYxIDE5MCBNIDU0MCAxNDAgQyA1ODAgMTIwLCA1ODAgMTYwLCA1NDAgMTgwIE0gNTgwIDE0MCBDIDU0MCAxMjAsIDU0MCAxNjAsIDU4MCAxODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM3NDc0RiIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgPC9zdmc+"
      },
      {
        "id": "med-08",
        "name": "Mental Health Soft Vectors",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTUwIiByPSIyNTAiIGZpbGw9IiNFOEVBRjYiIG9wYWNpdHk9IjAuOCIvPgogICAgPGNpcmNsZSBjeD0iMTAwMCIgY3k9IjY1MCIgcj0iMzAwIiBmaWxsPSIjRTNGMkZEIiBvcGFjaXR5PSIwLjgiLz4KICAgIDxwYXRoIGQ9Ik0gLTUwIDQwMCBDIDIwMCAyMDAsIDMwMCA2MDAsIDYwMCA0MDAgQyA5MDAgMjAwLCAxMDAwIDcwMCwgMTIwMCA1MDAgTCAxMjAwIDkwMCBMIC01MCA5MDAgWiIgZmlsbD0iI0YzRTVGNSIgb3BhY2l0eT0iMC42Ii8+CiAgPC9zdmc+"
      },
      {
        "id": "med-09",
        "name": "Emergency Response Contrast",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjExMjIiIGhlaWdodD0iODAiIGZpbGw9IiNEMzJGMkYiLz4KICAgIDxyZWN0IHg9IjAiIHk9IjcxMyIgd2lkdGg9IjExMjIiIGhlaWdodD0iODAiIGZpbGw9IiNEMzJGMkYiLz4KICAgIDxyZWN0IHg9IjAiIHk9IjgwIiB3aWR0aD0iODAiIGhlaWdodD0iNjMzIiBmaWxsPSIjRDMyRjJGIi8+CiAgICA8cmVjdCB4PSIxMDQyIiB5PSI4MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYzMyIgZmlsbD0iI0QzMkYyRiIvPgogICAgPCEtLSBNZWRpY2FsIENyb3NzZXMgLS0+CiAgICA8cGF0aCBkPSJNIDQwIDIwIEwgNDAgNjAgTSAyMCA0MCBMIDYwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTAiLz4KICAgIDxwYXRoIGQ9Ik0gMTA4MiAyMCBMIDEwODIgNjAgTSAxMDYyIDQwIEwgMTEwMiA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEwIi8+CiAgICA8cGF0aCBkPSJNIDQwIDczMyBMIDQwIDc3MyBNIDIwIDc1MyBMIDYwIDc1MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEwIi8+CiAgICA8cGF0aCBkPSJNIDEwODIgNzMzIEwgMTA4MiA3NzMgTSAxMDYyIDc1MyBMIDExMDIgNzUzIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTAiLz4KICA8L3N2Zz4="
      },
      {
        "id": "med-10",
        "name": "Modern Medical Architecture",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iNjAiIHk9IjYwIiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjY3MyIgZmlsbD0iI0Y1RjVGNSIvPgogICAgPHJlY3QgeD0iMjgwIiB5PSI2MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjY3MyIgZmlsbD0iIzRERDBFMSIvPgogICAgPHJlY3QgeD0iNjAiIHk9IjYwIiB3aWR0aD0iMTAwMiIgaGVpZ2h0PSIxNjAiIGZpbGw9IiNGNUY1RjUiLz4KICAgIDxyZWN0IHg9IjYwIiB5PSIyMjAiIHdpZHRoPSIxMDAyIiBoZWlnaHQ9IjE1IiBmaWxsPSIjNEREMEUxIi8+CiAgICA8cmVjdCB4PSI2MCIgeT0iNjAiIHdpZHRoPSIxMDAyIiBoZWlnaHQ9IjY3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRUVFRUVFIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8L3N2Zz4="
      }
    ]
  },
  {
    "name": "Kids & Early Learning",
    "orientation": "landscape",
    "items": [
      {
        "id": "kid-01",
        "name": "Playful Scalloped Edge",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzA2RDZBMCIvPgogICAgPHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMTA2MiIgaGVpZ2h0PSI3MzMiIHJ4PSIzMCIgcnk9IjMwIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiNGRkQxNjYiIHN0cm9rZS13aWR0aD0iMTUiLz4KICAgIDxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMjIiIGhlaWdodD0iNjkzIiByeD0iMjAiIHJ5PSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRUY0NzZGIiBzdHJva2Utd2lkdGg9IjEwIi8+CiAgICA8cmVjdCB4PSI3MCIgeT0iNzAiIHdpZHRoPSI5ODIiIGhlaWdodD0iNjUzIiByeD0iMTAiIHJ5PSIxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTE4QUIyIiBzdHJva2Utd2lkdGg9IjUiLz4KICA8L3N2Zz4="
      },
      {
        "id": "kid-02",
        "name": "Naive Art Sky Vector",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzg3Q0VFQiIvPgogICAgPHBhdGggZD0iTSAxMDAgMTUwIEMgMTAwIDEwMCwgMTUwIDEwMCwgMTUwIDE1MCBDIDIwMCAxMDAsIDI1MCAxNTAsIDI1MCAxODAgQyAyNTAgMjIwLCAxMDAgMjIwLCAxMDAgMTgwIFoiIGZpbGw9IiNmZmZmZmYiLz4KICAgIDxwYXRoIGQ9Ik0gODUwIDIwMCBDIDg1MCAxNTAsIDkwMCAxNTAsIDkwMCAyMDAgQyA5NTAgMTUwLCAxMDAwIDIwMCwgMTAwMCAyMzAgQyAxMDAwIDI3MCwgODUwIDI3MCwgODUwIDIzMCBaIiBmaWxsPSIjZmZmZmZmIi8+CiAgICA8cGF0aCBkPSJNIDQwMCAxMDAgTCA0MTUgMTMwIEwgNDUwIDEzNSBMIDQyNSAxNjAgTCA0MzAgMTkwIEwgNDAwIDE3NSBMIDM3MCAxOTAgTCAzNzUgMTYwIEwgMzUwIDEzNSBMIDM4NSAxMzAgWiIgZmlsbD0iI0ZGRDcwMCIvPgogICAgPHBhdGggZD0iTSA3MDAgODAgTCA3MTAgMTAwIEwgNzMwIDEwNSBMIDcxNSAxMjAgTCA3MjAgMTQwIEwgNzAwIDEzMCBMIDY4MCAxNDAgTCA2ODUgMTIwIEwgNjcwIDEwNSBMIDY5MCAxMDAgWiIgZmlsbD0iI0ZGRDcwMCIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "kid-03",
        "name": "Crayon Zig-Zag Vector",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHBvbHlsaW5lIHBvaW50cz0iMjAsNDAgMTAwLDgwIDE4MCw0MCAyNjAsODAgMzQwLDQwIDQyMCw4MCA1MDAsNDAgNTgwLDgwIDY2MCw0MCA3NDAsODAgODIwLDQwIDkwMCw4MCA5ODAsNDAgMTA2MCw4MCAxMTAyLDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNGRjNCMzAiIHN0cm9rZS13aWR0aD0iMjAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogICAgPHBvbHlsaW5lIHBvaW50cz0iMjAsNzUzIDEwMCw3MTMgMTgwLDc1MyAyNjAsNzEzIDM0MCw3NTMgNDIwLDcxMyA1MDAsNzUzIDU4MCw3MTMgNjYwLDc1MyA3NDAsNzEzIDgyMCw3NTMgOTAwLDcxMyA5ODAsNzUzIDEwNjAsNzEzIDExMDIsNzUzIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDdBRkYiIHN0cm9rZS13aWR0aD0iMjAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogICAgPHBvbHlsaW5lIHBvaW50cz0iNDAsMTAwIDgwLDE4MCA0MCwyNjAgODAsMzQwIDQwLDQyMCA4MCw1MDAgNDAsNTgwIDgwLDY2MCA0MCw3MDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzRDRDk2NCIgc3Ryb2tlLXdpZHRoPSIyMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgICA8cG9seWxpbmUgcG9pbnRzPSIxMDgyLDEwMCAxMDQyLDE4MCAxMDgyLDI2MCAxMDQyLDM0MCAxMDgyLDQyMCAxMDQyLDUwMCAxMDgyLDU4MCAxMDQyLDY2MCAxMDgyLDcwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZDQzAwIiBzdHJva2Utd2lkdGg9IjIwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8L3N2Zz4="
      },
      {
        "id": "kid-04",
        "name": "Flat Confetti Explosion",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPjxyZWN0IHg9Ijg3OS40NjA5NDY0Mzc0NDMyIiB5PSIzMzYuNDg2MDQxMTcyMjE3OCIgd2lkdGg9IjIxLjc2NjIwMzgyMjg4ODQ4NSIgaGVpZ2h0PSIyMS43NjYyMDM4MjI4ODg0ODUiIGZpbGw9IiNGRjk1MDAiIHRyYW5zZm9ybT0icm90YXRlKDQ2Ljk3NzcyNzYyNTExMjE2NiA4NzkuNDYwOTQ2NDM3NDQzMiAzMzYuNDg2MDQxMTcyMjE3OCkiLz48Y2lyY2xlIGN4PSI1MTcuNzA0Nzc2MDgwNjM4MiIgY3k9IjI5Ny4zNDA2NTM2MTAxNjM5NCIgcj0iNS42NDI1NzE1NTg5MTMwMDIiIGZpbGw9IiM1ODU2RDYiLz48Y2lyY2xlIGN4PSIxMDA2LjU4MDU2Nzc3ODU2MDYiIGN5PSI0NDMuNDE5OTgwMjUyNTU1ODMiIHI9IjQuOTQzMjM4NjkyODM3NDk1IiBmaWxsPSIjNTg1NkQ2Ii8+PHJlY3QgeD0iMTAwMy45MjQ0OTE2NzQzMTIyIiB5PSI2MTcuOTIyNTY0MjcxNTQ2NSIgd2lkdGg9IjIzLjUyNjA4NDYxNzY4MjE2NiIgaGVpZ2h0PSIyMy41MjYwODQ2MTc2ODIxNjYiIGZpbGw9IiM0Q0Q5NjQiIHRyYW5zZm9ybT0icm90YXRlKDYwLjkwMzY3OTgzOTA5MzQ3IDEwMDMuOTI0NDkxNjc0MzEyMiA2MTcuOTIyNTY0MjcxNTQ2NSkiLz48Y2lyY2xlIGN4PSI4NDYuMzU2MDc5NzU0NTg3IiBjeT0iNzI3LjE0OTA0Njg5MzI1NzgiIHI9IjkuMzYzMTQxNTM3NTM3ODYyIiBmaWxsPSIjMDA3QUZGIi8+PGNpcmNsZSBjeD0iNzkwLjQ4Mjg1MzU2MTQzODciIGN5PSI1MzAuNjIzNjAzNTIxNzI0NyIgcj0iMTEuNTc1ODU2MTM5ODQwOTA3IiBmaWxsPSIjRkYzQjMwIi8+PHJlY3QgeD0iMTA4Ny44NTA3NzA2NDkyOTk0IiB5PSIzNTAuNzA5MzIzNzkyODc4MTQiIHdpZHRoPSIxOC43MDk0NDIzOTQ2NDg2OSIgaGVpZ2h0PSIxOC43MDk0NDIzOTQ2NDg2OSIgZmlsbD0iI0ZGOTUwMCIgdHJhbnNmb3JtPSJyb3RhdGUoODIuMzIzNjk5NjE1NjQwMjQgMTA4Ny44NTA3NzA2NDkyOTk0IDM1MC43MDkzMjM3OTI4NzgxNCkiLz48Y2lyY2xlIGN4PSI4NC4wNDE4ODYyNTEyMDAyOCIgY3k9Ijc4My45NTkwNTc2NDIwNTY2IiByPSIxMS4wNjA1Nzc0NTEzNjc5NTUiIGZpbGw9IiNGRjk1MDAiLz48Y2lyY2xlIGN4PSI4NjkuNjgyMDU5OTE0ODA1MiIgY3k9IjkuNTY4MzgyMzg0MTcyMzEiIHI9IjExLjU4NzMwMDUwODEwMjQ5IiBmaWxsPSIjRkY5NTAwIi8+PHJlY3QgeD0iMzEyLjA1MzQyMTAwNzgzNyIgeT0iMjcwLjQwMDA5NzU0NTE3Mjc0IiB3aWR0aD0iMTEuMjYyNjkzNjc1NTM0NDk2IiBoZWlnaHQ9IjExLjI2MjY5MzY3NTUzNDQ5NiIgZmlsbD0iIzRDRDk2NCIgdHJhbnNmb3JtPSJyb3RhdGUoMTcuOTI0NjU5MTE4NDMwMjkgMzEyLjA1MzQyMTAwNzgzNyAyNzAuNDAwMDk3NTQ1MTcyNzQpIi8+PGNpcmNsZSBjeD0iMzYuOTQ2NTk5OTgzMTMyOTMiIGN5PSI3MzAuOTU1OTE3MDgzNjk3NiIgcj0iNS4xODA5NDUxODE2OTk1NDIiIGZpbGw9IiNGRkNDMDAiLz48Y2lyY2xlIGN4PSI5NjkuNDMxNDMxMjk3NzA0OCIgY3k9IjcyMC45NTIwNDk0MzgwMTc4IiByPSI5LjY3MDI1NjE0MTU2NDM0NCIgZmlsbD0iIzRDRDk2NCIvPjxyZWN0IHg9IjE0Ljk4MDUyMTc1MDI4MTY1IiB5PSIxMTIuODYwNDU5OTg0MDMzNSIgd2lkdGg9IjguOTE4NDQ5NzEyNjIwMzY5IiBoZWlnaHQ9IjguOTE4NDQ5NzEyNjIwMzY5IiBmaWxsPSIjNENEOTY0IiB0cmFuc2Zvcm09InJvdGF0ZSg1OS41MzM1MzgxMDIwNjczOTYgMTQuOTgwNTIxNzUwMjgxNjUgMTEyLjg2MDQ1OTk4NDAzMzUpIi8+PGNpcmNsZSBjeD0iNzExLjQyNDA3NjczMTQyMTEiIGN5PSI2NjAuMjU2MzIzMTA4NzA3MSIgcj0iMTAuMDY3MDY4Nzc1NDU2ODM5IiBmaWxsPSIjNTg1NkQ2Ii8+PGNpcmNsZSBjeD0iNTk0LjgwNzA2MjE4NTE1MzMiIGN5PSI2NTYuMTA3OTE1NDE0MTg2NCIgcj0iOS4xNTQ1MjQ3NDU1NTg5ODkiIGZpbGw9IiNGRkNDMDAiLz48cmVjdCB4PSIxMjIuMDc5MzY3NzIxNDMyNjkiIHk9IjU3LjQxMzIzMDU5NjIzMTg3IiB3aWR0aD0iMTAuMTIwMDY1OTkyNTEzMjk3IiBoZWlnaHQ9IjEwLjEyMDA2NTk5MjUxMzI5NyIgZmlsbD0iIzAwN0FGRiIgdHJhbnNmb3JtPSJyb3RhdGUoMzAuMjU0ODM1NTM5NjQ4Nzc3IDEyMi4wNzkzNjc3MjE0MzI2OSA1Ny40MTMyMzA1OTYyMzE4NykiLz48Y2lyY2xlIGN4PSI0MjguMzMxMTUxMzcyMjQyOSIgY3k9IjI5NS43MjY2NjczNDc3ODAxIiByPSI3LjUzNzEyNDkzMTc3MDk5NyIgZmlsbD0iI0ZGOTUwMCIvPjxjaXJjbGUgY3g9IjY2LjEzMjU3OTIzNjI0Nzk4IiBjeT0iMjEuMjM4Njk0NTIwMTM3MjIiIHI9IjEwLjQ1NDA5NTYyOTE4OTQ4MiIgZmlsbD0iIzAwN0FGRiIvPjxyZWN0IHg9IjIxMC40NDc0MzUzNzQ4NTI0MyIgeT0iNjYyLjgzNzIzNTA2ODI4MjMiIHdpZHRoPSIyMi41ODExNTAxNDk1NDQyIiBoZWlnaHQ9IjIyLjU4MTE1MDE0OTU0NDIiIGZpbGw9IiMwMDdBRkYiIHRyYW5zZm9ybT0icm90YXRlKDczLjc4ODgxNzcwNTI0Nzk2IDIxMC40NDc0MzUzNzQ4NTI0MyA2NjIuODM3MjM1MDY4MjgyMykiLz48Y2lyY2xlIGN4PSI2MzYuNzYzNTEwODc0MDY3NiIgY3k9IjUzNS4wMjU3NjU5Mjc2Mzk5IiByPSI0LjYwOTA1NzU5OTg1NDM0OSIgZmlsbD0iI0ZGOTUwMCIvPjxjaXJjbGUgY3g9IjEwNDAuMTIzOTE4ODg2MTEzNCIgY3k9IjI1OC42NDk2Njk4NTEzOTA2IiByPSI2LjEwODY0ODI5MDIyMjE5IiBmaWxsPSIjNTg1NkQ2Ii8+PHJlY3QgeD0iODc2LjE5NzgxODQ2MTM2ODUiIHk9IjI1NC40NDQ1OTI1MzY3NjM4OCIgd2lkdGg9IjIyLjA1MjQzNTc5MzY4NTQxNSIgaGVpZ2h0PSIyMi4wNTI0MzU3OTM2ODU0MTUiIGZpbGw9IiMwMDdBRkYiIHRyYW5zZm9ybT0icm90YXRlKDEuNDk3NzczNTcxNjIyNDIzOSA4NzYuMTk3ODE4NDYxMzY4NSAyNTQuNDQ0NTkyNTM2NzYzODgpIi8+PGNpcmNsZSBjeD0iNDM3Ljc0MTE3MTkzMzMxODkiIGN5PSI3ODkuNTQ5ODg2OTA4MzgyMiIgcj0iNy41MzI4MTI5OTc5MDQ4MDc1IiBmaWxsPSIjRkYzQjMwIi8+PGNpcmNsZSBjeD0iMTA5NC45MTY2MTU2NDk5OTIiIGN5PSI2MDIuMjcyMzc3MTA2MDQ4OSIgcj0iNi41MzUxMDEzMzQxMDE1ODkiIGZpbGw9IiM0Q0Q5NjQiLz48cmVjdCB4PSI3NC4yOTcxNTYzNTQ5MTM5MiIgeT0iNDkwLjM2NzUyODM0Nzk4NTA2IiB3aWR0aD0iMjMuNTk5NjI1NTIxNTI1NDciIGhlaWdodD0iMjMuNTk5NjI1NTIxNTI1NDciIGZpbGw9IiM1ODU2RDYiIHRyYW5zZm9ybT0icm90YXRlKDc5LjE3NTg2OTkyODg2OTYzIDc0LjI5NzE1NjM1NDkxMzkyIDQ5MC4zNjc1MjgzNDc5ODUwNikiLz48Y2lyY2xlIGN4PSI0NDIuNTEyOTc2ODAwMTQwNSIgY3k9Ijc2Mi44MjI4NTA5MjExOTkxIiByPSI4LjY4NjMwMTI1ODQ0MTQ4MiIgZmlsbD0iIzU4NTZENiIvPjxjaXJjbGUgY3g9IjY2Ni4wMTA1MzMwODA3MDI5IiBjeT0iMjkxLjI4MjgzNTgzMTY4ODAzIiByPSI3LjEwODk2OTM2OTkzMDg0MiIgZmlsbD0iI0ZGM0IzMCIvPjxyZWN0IHg9IjUxOS4wNjgxMDI2NjE0OTUzIiB5PSIyNzguNzczMDk4Mjc0OTg1NDQiIHdpZHRoPSIxOS40ODc1NjE0MDc0MjUxODYiIGhlaWdodD0iMTkuNDg3NTYxNDA3NDI1MTg2IiBmaWxsPSIjRkY5NTAwIiB0cmFuc2Zvcm09InJvdGF0ZSgyMy4xMjc5ODMzMjg2Mzc1NjYgNTE5LjA2ODEwMjY2MTQ5NTMgMjc4Ljc3MzA5ODI3NDk4NTQ0KSIvPjxjaXJjbGUgY3g9IjEwNzkuNDE0MDQxODU3OTYwNyIgY3k9IjE0MS42NjUzNjQ1OTI0ODU1MyIgcj0iNy44NDUwMDg0OTYwOTM2NDUiIGZpbGw9IiNGRkNDMDAiLz48Y2lyY2xlIGN4PSIzOTMuMzU5MzYyODc1MjI0MDYiIGN5PSI1NzkuMjA4MzMyMzU1NjA3NCIgcj0iMTEuMDQwNzE4MjU4OTc0NzE5IiBmaWxsPSIjNENEOTY0Ii8+PHJlY3QgeD0iNjQ2LjgwMjczOTUyOTQwOCIgeT0iNjY1LjAwNDM5MDc5OTA4NyIgd2lkdGg9IjIzLjc3MDMzMTgxMDY2MDA0NiIgaGVpZ2h0PSIyMy43NzAzMzE4MTA2NjAwNDYiIGZpbGw9IiNGRkNDMDAiIHRyYW5zZm9ybT0icm90YXRlKDU0LjUyMzI3NzI5MTk5MTMzIDY0Ni44MDI3Mzk1Mjk0MDggNjY1LjAwNDM5MDc5OTA4NykiLz48Y2lyY2xlIGN4PSI0MDkuNjg4NTYxMzQ3NzY5IiBjeT0iNjAwLjYxOTM2NTYxNTM2NzQiIHI9IjkuNjQ4MjI4Nzk0ODQ0ODkzIiBmaWxsPSIjRkYzQjMwIi8+PGNpcmNsZSBjeD0iOTYyLjk3OTU4NTIxMDM5NjciIGN5PSI1ODkuOTA3NDkxMDYwMDM0NSIgcj0iOC41NjE3NTEzMjE0NDkxMDgiIGZpbGw9IiNGRjNCMzAiLz48cmVjdCB4PSIzMDMuMDg4Mjc5MzUzNTc4OSIgeT0iMzUzLjEyMzc1MDc4MjMzMDMiIHdpZHRoPSI4LjU1MTM5OTY3ODMwMzM0NCIgaGVpZ2h0PSI4LjU1MTM5OTY3ODMwMzM0NCIgZmlsbD0iIzAwN0FGRiIgdHJhbnNmb3JtPSJyb3RhdGUoNDAuNjUyMzIxNjA4ODgxNDYgMzAzLjA4ODI3OTM1MzU3ODkgMzUzLjEyMzc1MDc4MjMzMDMpIi8+PGNpcmNsZSBjeD0iNDA1LjIyODU2NDAxMTU2MDM3IiBjeT0iNjE0LjU0NjIzNDgzNzE0ODkiIHI9IjkuNDA5NzYzNTQxMjc0NzUzIiBmaWxsPSIjNTg1NkQ2Ii8+PGNpcmNsZSBjeD0iNzM5LjIxNjY1ODc1OTA1NjciIGN5PSI3NDcuMDE0ODg2Mjg4OTQxOSIgcj0iOS4xODQxOTA3MzY3NzQ5OTIiIGZpbGw9IiMwMDdBRkYiLz48cmVjdCB4PSI5NTEuNTI5MzcwNTYxODk4OSIgeT0iNzQuMzY2NzgwMTU1NDQwMTEiIHdpZHRoPSI4LjcwMDA1NTY3NDg4OTI0NCIgaGVpZ2h0PSI4LjcwMDA1NTY3NDg4OTI0NCIgZmlsbD0iIzRDRDk2NCIgdHJhbnNmb3JtPSJyb3RhdGUoMjguOTM0MDY2MTQ3NjA2OTg4IDk1MS41MjkzNzA1NjE4OTg5IDc0LjM2Njc4MDE1NTQ0MDExKSIvPjxjaXJjbGUgY3g9Ijk0MS4wMjk3MTU3Mzc5MjUyIiBjeT0iMzgxLjk1MTU2NTM5NjMwNjkzIiByPSIxMC4yNDc3MDEwODY0MTQwOTMiIGZpbGw9IiNGRjk1MDAiLz48Y2lyY2xlIGN4PSI4MzUuNjQ5NzU1NDQ3MTMzOCIgY3k9IjE5Ni4zMTA2NzkyMDY4NzczOCIgcj0iNS40MDE3NTMxMTcwNzcyMTIiIGZpbGw9IiNGRkNDMDAiLz48cmVjdCB4PSI5NTMuNTEwODI3NjA2MTcyOCIgeT0iMjcyLjIwMDMwOTY4NjE0MDI2IiB3aWR0aD0iMTEuMTMwODY0NTkyNTUxMzEyIiBoZWlnaHQ9IjExLjEzMDg2NDU5MjU1MTMxMiIgZmlsbD0iIzAwN0FGRiIgdHJhbnNmb3JtPSJyb3RhdGUoMTMuODMzMTYzNDY2MTk3MjM0IDk1My41MTA4Mjc2MDYxNzI4IDI3Mi4yMDAzMDk2ODYxNDAyNikiLz48Y2lyY2xlIGN4PSI1ODcuMjI2Mzg2NjE4OTg0OSIgY3k9IjI1Ny4xODU5MTEwMDIyMzQ0IiByPSI0Ljg1MTU4OTAxNTY0Mjc4MyIgZmlsbD0iI0ZGM0IzMCIvPjxjaXJjbGUgY3g9IjE3OC45MTM0MDMwMjE1MTUzNiIgY3k9IjE4NS45NDkwMTIwMDUxMTk1NiIgcj0iMTEuNzUxMjAxNTU4MzQ3MTMiIGZpbGw9IiNGRjk1MDAiLz48cmVjdCB4PSI4MDYuNzUxMjI4MjM1MDk0NiIgeT0iNTQ3LjU2MjE1NTQ4MjA0MyIgd2lkdGg9IjE1LjEwNTMwMzcxNTcxNzM3IiBoZWlnaHQ9IjE1LjEwNTMwMzcxNTcxNzM3IiBmaWxsPSIjRkYzQjMwIiB0cmFuc2Zvcm09InJvdGF0ZSg0OC45MDcxMzAwNjU2NjIyMTYgODA2Ljc1MTIyODIzNTA5NDYgNTQ3LjU2MjE1NTQ4MjA0MykiLz48Y2lyY2xlIGN4PSI3NDYuNTUwMzY4MDY4ODI3NCIgY3k9IjQ0NC43NjYwNDQ5MzMyOTEzIiByPSI0LjMyMDIwMzk1OTkxNTI0IiBmaWxsPSIjNTg1NkQ2Ii8+PGNpcmNsZSBjeD0iMjI5LjA0MjU5MjA0NTI4MDYzIiBjeT0iNzE0LjI1MTA5NjAyNTgxNjIiIHI9IjcuMjU5Mzc3OTg2NzU3NDY3NSIgZmlsbD0iIzU4NTZENiIvPjxyZWN0IHg9Ijk0LjI3MDE0MjcyMTU0MjkiIHk9IjYyNi4xMDE3ODY0ODEzMjA3IiB3aWR0aD0iMTQuNzIyMDEyOTA3NzQzMzk4IiBoZWlnaHQ9IjE0LjcyMjAxMjkwNzc0MzM5OCIgZmlsbD0iIzRDRDk2NCIgdHJhbnNmb3JtPSJyb3RhdGUoNDAuMTk1MDQwNzExNTg3NTY2IDk0LjI3MDE0MjcyMTU0MjkgNjI2LjEwMTc4NjQ4MTMyMDcpIi8+PGNpcmNsZSBjeD0iMTcwLjk2NzAxNzYxMDgzMjU4IiBjeT0iOTUuMTI5NzgxMjU0NTgxNTkiIHI9IjcuMjE0NDY4MzU3Nzc5Njk1IiBmaWxsPSIjRkYzQjMwIi8+PGNpcmNsZSBjeD0iMTEyLjQ5NjA4ODQ5MTU3ODU4IiBjeT0iNDgyLjA1NDg0MTAxMjk4NDI0IiByPSI3Ljg3NTk4ODAwMDAxNzQ3IiBmaWxsPSIjNTg1NkQ2Ii8+PHJlY3QgeD0iMjguMzE1OTQ1OTQ3NDgxODMiIHk9IjU3Mi4xNDQ2NDM4MjM0MDc0IiB3aWR0aD0iMTIuNjY1OTcxNjY5NDE3OTIiIGhlaWdodD0iMTIuNjY1OTcxNjY5NDE3OTIiIGZpbGw9IiNGRjk1MDAiIHRyYW5zZm9ybT0icm90YXRlKDYyLjUyNTMzMTE5NDY1NjIxIDI4LjMxNTk0NTk0NzQ4MTgzIDU3Mi4xNDQ2NDM4MjM0MDc0KSIvPjxjaXJjbGUgY3g9IjkyNS44ODMxNjU1Mjc0NTk2IiBjeT0iNjcxLjE1MjA4NTA0MDQxNjEiIHI9IjYuNTg2NzEyMjE1NzQ0NjY1IiBmaWxsPSIjRkZDQzAwIi8+PGNpcmNsZSBjeD0iNzgwLjkyODk5OTgwOTQ0NjIiIGN5PSI2NTAuODAyMzU1Mjg3NDUzNyIgcj0iMTEuMzQ3NzI3MzQwMDQ5MzU4IiBmaWxsPSIjNENEOTY0Ii8+PHJlY3QgeD0iOTQ4LjQ3NDM2NDk4MDEyMzkiIHk9IjUzMy4yNDI2MTcwNjgxNzgiIHdpZHRoPSIxMi4wOTc3MzQ4NTI2MDMxMjkiIGhlaWdodD0iMTIuMDk3NzM0ODUyNjAzMTI5IiBmaWxsPSIjRkY5NTAwIiB0cmFuc2Zvcm09InJvdGF0ZSg1Ni4yNzA1MDQyNjk0OTk2OSA5NDguNDc0MzY0OTgwMTIzOSA1MzMuMjQyNjE3MDY4MTc4KSIvPjxjaXJjbGUgY3g9IjMyNy40NzM2MTE5NzExMTYxIiBjeT0iNDc3Ljc4NDQwMTk1ODQwNjgiIHI9IjUuMDg5MzU4Mjc4ODc0ODUyIiBmaWxsPSIjRkZDQzAwIi8+PGNpcmNsZSBjeD0iNjM0LjIzMjIyMTIzNjQ0NjIiIGN5PSI3MTEuMjAzMTYwNjAwODkyNyIgcj0iOS40MTA4OTcxMDYwOTczNDEiIGZpbGw9IiNGRjNCMzAiLz48cmVjdCB4PSI1OC4wMzg5MTkyODgwNDczMjUiIHk9IjE5LjczNzM1MDc1OTc5MDU5OCIgd2lkdGg9IjIxLjc2Nzk2NTAxMjQ4MzQyIiBoZWlnaHQ9IjIxLjc2Nzk2NTAxMjQ4MzQyIiBmaWxsPSIjMDA3QUZGIiB0cmFuc2Zvcm09InJvdGF0ZSgyMy4wMTA0NTQzNjkyOTAyMzcgNTguMDM4OTE5Mjg4MDQ3MzI1IDE5LjczNzM1MDc1OTc5MDU5OCkiLz48Y2lyY2xlIGN4PSIxMDc0LjMzNzU2NzU1MjcxNzUiIGN5PSI1OTQuMDI1NTk4MTU3NzA4MyIgcj0iOS44MjQ0NTgwNjQ1OTg0NyIgZmlsbD0iI0ZGM0IzMCIvPjxjaXJjbGUgY3g9Ijk5MS4xNzA2NTYyMTU4NDYiIGN5PSI1ODAuMzc1MzQ3NjQ1NzIyOSIgcj0iNC4yMTgwNTcwMzQ1NDAxNjIiIGZpbGw9IiNGRkNDMDAiLz48cmVjdCB4PSIxMDM1LjcxOTA2MTQ5NTMzNjMiIHk9IjEwMi45Njk3ODQxMTYxMjk4OSIgd2lkdGg9IjIxLjk3MTg5MTU0Mzg2NjQ3IiBoZWlnaHQ9IjIxLjk3MTg5MTU0Mzg2NjQ3IiBmaWxsPSIjRkZDQzAwIiB0cmFuc2Zvcm09InJvdGF0ZSg1Ny41NDE2NjYwMjUwNTYyNyAxMDM1LjcxOTA2MTQ5NTMzNjMgMTAyLjk2OTc4NDExNjEyOTg5KSIvPjxjaXJjbGUgY3g9IjEwNjcuNDkyNDkxNDkyMzE0MiIgY3k9IjQyMi45OTQ5MjkxMDM0MDI0NiIgcj0iOS4yNzA1MzQzNTAzODU5MDgiIGZpbGw9IiMwMDdBRkYiLz48Y2lyY2xlIGN4PSI0MTYuMDU1NTE4OTIwNTY2NCIgY3k9IjI5Ny42OTI2MzY1MTE5OTQ2IiByPSI4LjIzMjcxNDM5MDQ2ODY2OSIgZmlsbD0iIzU4NTZENiIvPjwvc3ZnPg=="
      },
      {
        "id": "kid-05",
        "name": "Geometric Jungle Safari",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0YxRjhFOSIvPgogICAgPHBhdGggZD0iTSAwIDAgQyAxNTAgMCwgMTUwIDE1MCwgMCAxNTAgWiIgZmlsbD0iIzRDQUY1MCIvPgogICAgPHBhdGggZD0iTSAwIDEwMCBDIDIwMCAxMDAsIDIwMCAyNTAsIDAgMjUwIFoiIGZpbGw9IiMzODhFM0MiLz4KICAgIDxwYXRoIGQ9Ik0gMTEyMiA3OTMgQyA5NzIgNzkzLCA5NzIgNjQzLCAxMTIyIDY0MyBaIiBmaWxsPSIjNENBRjUwIi8+CiAgICA8cGF0aCBkPSJNIDExMjIgNjkzIEMgOTIyIDY5MywgOTIyIDU0MywgMTEyMiA1NDMgWiIgZmlsbD0iIzM4OEUzQyIvPgogICAgPGNpcmNsZSBjeD0iODAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiNGRkVCM0IiLz4KICAgIDxjaXJjbGUgY3g9IjEwNDIiIGN5PSI3MTMiIHI9IjQwIiBmaWxsPSIjRkZFQjNCIi8+CiAgPC9zdmc+"
      },
      {
        "id": "kid-06",
        "name": "Flat Vector Cosmos",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFBMjM3RSIvPgogICAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSI4MCIgZmlsbD0iI0ZGOTgwMCIvPgogICAgPGVsbGlwc2UgY3g9IjIwMCIgY3k9IjIwMCIgcng9IjEyMCIgcnk9IjMwIiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkMxMDciIHN0cm9rZS13aWR0aD0iMTAiIHRyYW5zZm9ybT0icm90YXRlKDIwIDIwMCAyMDApIi8+CiAgICA8Y2lyY2xlIGN4PSI5MDAiIGN5PSI2MDAiIHI9IjUwIiBmaWxsPSIjNENBRjUwIi8+CiAgICA8cGF0aCBkPSJNIDg1MCAxNTAgTCA4ODAgMTAwIEwgOTEwIDE1MCBMIDk1MCAxODAgTCA5MTAgMjEwIEwgODgwIDI2MCBMIDg1MCAyMTAgTCA4MTAgMTgwIFoiIGZpbGw9IiNGRkVCM0IiLz4KICAgIDxwYXRoIGQ9Ik0gMzAwIDY1MCBMIDMyMCA2MDAgTCAzNDAgNjUwIEwgMzgwIDY3MCBMIDM0MCA2OTAgTCAzMjAgNzQwIEwgMzAwIDY5MCBMIDI2MCA2NzAgWiIgZmlsbD0iI0ZGRUIzQiIvPgogICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNTAwIiByPSI4IiBmaWxsPSIjZmZmZmZmIi8+CiAgICA8Y2lyY2xlIGN4PSI3MDAiIGN5PSIxMDAiIHI9IjEwIiBmaWxsPSIjZmZmZmZmIi8+CiAgICA8Y2lyY2xlIGN4PSI1MDAiIGN5PSI3MDAiIHI9IjYiIGZpbGw9IiNmZmZmZmYiLz4KICA8L3N2Zz4="
      },
      {
        "id": "kid-07",
        "name": "Toy Building Blocks",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPGcgZmlsbD0iI0Y0NDMzNiI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSI4MCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjI1Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iNDAiIHI9IjI1Ii8+PC9nPgogICAgPGcgZmlsbD0iIzIxOTZGMyI+PHJlY3QgeD0iMjAwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIi8+PGNpcmNsZSBjeD0iMjUwIiBjeT0iNDAiIHI9IjI1Ii8+PC9nPgogICAgPGcgZmlsbD0iI0ZGRUIzQiI+PHJlY3QgeD0iMzAwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjgwIi8+PGNpcmNsZSBjeD0iMzUwIiBjeT0iNDAiIHI9IjI1Ii8+PGNpcmNsZSBjeD0iNDUwIiBjeT0iNDAiIHI9IjI1Ii8+PGNpcmNsZSBjeD0iNTUwIiBjeT0iNDAiIHI9IjI1Ii8+PC9nPgogICAgPGcgZmlsbD0iIzRDQUY1MCI+PHJlY3QgeD0iNjAwIiB5PSIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIi8+PGNpcmNsZSBjeD0iNjUwIiBjeT0iNDAiIHI9IjI1Ii8+PGNpcmNsZSBjeD0iNzUwIiBjeT0iNDAiIHI9IjI1Ii8+PC9nPgogICAgPGcgZmlsbD0iIzlDMjdCMCI+PHJlY3QgeD0iODAwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIi8+PGNpcmNsZSBjeD0iODUwIiBjeT0iNDAiIHI9IjI1Ii8+PC9nPgogICAgPGcgZmlsbD0iI0ZGOTgwMCI+PHJlY3QgeD0iOTAwIiB5PSIwIiB3aWR0aD0iMjIyIiBoZWlnaHQ9IjgwIi8+PGNpcmNsZSBjeD0iOTUwIiBjeT0iNDAiIHI9IjI1Ii8+PGNpcmNsZSBjeD0iMTA1MCIgY3k9IjQwIiByPSIyNSIvPjwvZz4KICAgIAogICAgPGcgZmlsbD0iIzRDQUY1MCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwgNzEzKSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSI4MCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjI1Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iNDAiIHI9IjI1Ii8+PC9nPgogICAgPGcgZmlsbD0iI0ZGRUIzQiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAwLCA3MTMpIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMjUiLz48L2c+CiAgICA8ZyBmaWxsPSIjRjQ0MzM2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMDAsIDcxMykiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIzMDAiIGhlaWdodD0iODAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyNSIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjQwIiByPSIyNSIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjQwIiByPSIyNSIvPjwvZz4KICAgIDxnIGZpbGw9IiMyMTk2RjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYwMCwgNzEzKSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSI4MCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjI1Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iNDAiIHI9IjI1Ii8+PC9nPgogICAgPGcgZmlsbD0iI0ZGOTgwMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODAwLCA3MTMpIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMjUiLz48L2c+CiAgICA8ZyBmaWxsPSIjOUMyN0IwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MDAsIDcxMykiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMjIiIGhlaWdodD0iODAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyNSIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjQwIiByPSIyNSIvPjwvZz4KICA8L3N2Zz4="
      },
      {
        "id": "kid-08",
        "name": "Vector Bunting Flags",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZBRkFGQSIvPgogICAgPHBhdGggZD0iTSAwIDUwIFEgMjgwIDE1MCA1NjEgNTAgVCAxMTIyIDUwIiBmaWxsPSJub25lIiBzdHJva2U9IiM0MjQyNDIiIHN0cm9rZS13aWR0aD0iMyIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI4MCw3NSAxNDAsNzUgMTEwLDE2MCIgZmlsbD0iI0U5MUU2MyIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIxODAsOTUgMjQwLDk1IDIxMCwxODAiIGZpbGw9IiMwMEJDRDQiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjgwLDExMCAzNDAsMTEwIDMxMCwxOTUiIGZpbGw9IiNGRkMxMDciLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMzgwLDExNSA0NDAsMTE1IDQxMCwyMDAiIGZpbGw9IiM4QkMzNEEiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNDgwLDExNSA1NDAsMTE1IDUxMCwyMDAiIGZpbGw9IiM5QzI3QjAiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNTgwLDExNSA2NDAsMTE1IDYxMCwyMDAiIGZpbGw9IiNGRjU3MjIiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNjgwLDExNSA3NDAsMTE1IDcxMCwyMDAiIGZpbGw9IiMwM0E5RjQiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNzgwLDExMCA4NDAsMTEwIDgxMCwxOTUiIGZpbGw9IiNGRkVCM0IiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iODgwLDk1IDk0MCw5NSA5MTAsMTgwIiBmaWxsPSIjNENBRjUwIi8+CiAgICA8cG9seWdvbiBwb2ludHM9Ijk4MCw3NSAxMDQwLDc1IDEwMTAsMTYwIiBmaWxsPSIjRTkxRTYzIi8+CiAgPC9zdmc+"
      },
      {
        "id": "kid-09",
        "name": "Stylized Flat Ocean",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0UwRjdGQSIvPgogICAgPHBhdGggZD0iTSAwIDY1MCBRIDE1MCA1NTAgMzAwIDY1MCBUIDYwMCA2NTAgVCA5MDAgNjUwIFQgMTIwMCA2NTAgTCAxMjAwIDc5MyBMIDAgNzkzIFoiIGZpbGw9IiM0REQwRTEiLz4KICAgIDxwYXRoIGQ9Ik0gLTE1MCA3MDAgUSAwIDYwMCAxNTAgNzAwIFQgNDUwIDcwMCBUIDc1MCA3MDAgVCAxMDUwIDcwMCBUIDEzNTAgNzAwIEwgMTM1MCA3OTMgTCAtMTUwIDc5MyBaIiBmaWxsPSIjMDBCQ0Q0Ii8+CiAgICA8cGF0aCBkPSJNIDAgNzUwIFEgMTUwIDY1MCAzMDAgNzUwIFQgNjAwIDc1MCBUIDkwMCA3NTAgVCAxMjAwIDc1MCBMIDEyMDAgNzkzIEwgMCA3OTMgWiIgZmlsbD0iIzAwOTdBNyIvPgogIDwvc3ZnPg=="
      },
      {
        "id": "kid-10",
        "name": "Vector Animal Tracks",
        "url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZGRjhFMSIvPgogICAgPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMTA0MiIgaGVpZ2h0PSI3MTMiIHJ4PSIyMCIgcnk9IjIwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4RDZFNjMiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWRhc2hhcnJheT0iMjAgMjAiLz4KICAgIDwhLS0gVHJhY2tzIC0tPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLCAxMDApIHJvdGF0ZSg0NSkgc2NhbGUoMS41KSIgZmlsbD0iIzVENDAzNyI+CiAgICAgIDxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjEwIi8+PGNpcmNsZSBjeD0iMCIgY3k9Ii01IiByPSI0Ii8+PGNpcmNsZSBjeD0iMTUiIGN5PSItMTAiIHI9IjQiLz48Y2lyY2xlIGN4PSIzMCIgY3k9Ii01IiByPSI0Ii8+CiAgICA8L2c+CiAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNTAsIDgwKSByb3RhdGUoNzApIHNjYWxlKDEuNSkiIGZpbGw9IiM1RDQwMzciPgogICAgICA8Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMCIvPjxjaXJjbGUgY3g9IjAiIGN5PSItNSIgcj0iNCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iLTEwIiByPSI0Ii8+PGNpcmNsZSBjeD0iMzAiIGN5PSItNSIgcj0iNCIvPgogICAgPC9nPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODUwLCA4MCkgcm90YXRlKC03MCkgc2NhbGUoMS41KSIgZmlsbD0iIzVENDAzNyI+CiAgICAgIDxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjEwIi8+PGNpcmNsZSBjeD0iMCIgY3k9Ii01IiByPSI0Ii8+PGNpcmNsZSBjeD0iMTUiIGN5PSItMTAiIHI9IjQiLz48Y2lyY2xlIGN4PSIzMCIgY3k9Ii01IiByPSI0Ii8+CiAgICA8L2c+CiAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAwLCAxMDApIHJvdGF0ZSgtNDUpIHNjYWxlKDEuNSkiIGZpbGw9IiM1RDQwMzciPgogICAgICA8Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMCIvPjxjaXJjbGUgY3g9IjAiIGN5PSItNSIgcj0iNCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iLTEwIiByPSI0Ii8+PGNpcmNsZSBjeD0iMzAiIGN5PSItNSIgcj0iNCIvPgogICAgPC9nPgogIDwvc3ZnPg=="
      }
    ]
  }
];





export default function TemplateEditor({
  initialId,
  initialName = "",
  initialDescription = "",
  initialDesignData,
  isEdit = false,
}: TemplateEditorProps) {
  const router = useRouter();
  const [activeSigTab, setActiveSigTab] = useState<'name' | 'line' | 'title'>('name');
  const [activePropTab, setActivePropTab] = useState<string>('content');

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
  const [activeTab, setActiveTab] = useState<"components" | "builder" | "json" | "background" | "presets">("components");
  const [previousTab, setPreviousTab] = useState<"components" | "builder" | "json" | "background" | "presets">("components");


  const [jsonText, setJsonText] = useState(JSON.stringify(parsedInitial, null, 2));
  const [saving, setSaving] = useState(false);

  const [activeGuides, setActiveGuides] = useState<{ vertical: number | null; horizontal: number | null }>({ vertical: null, horizontal: null });
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const signaturePadRef = useRef<any>(null);


  // Dynamic Typography Engine: extract used Google Fonts
  const usedFonts = React.useMemo(() => {
    const fonts = new Set<string>();
    if (design?.canvasElements) {
      design.canvasElements.forEach(el => {
        if (el.fontFamily && !el.fontFamily.startsWith('var(') && el.fontFamily !== 'Arial' && el.fontFamily !== 'sans-serif') {
          fonts.add(el.fontFamily);
        }
      });
    }
    return Array.from(fonts);
  }, [design?.canvasElements]);

  const googleFontsUrl = usedFonts.length > 0
    ? `https://fonts.googleapis.com/css2?${usedFonts.map(f => {
        const weights = FONT_SUPPORTED_WEIGHTS[f] || ["400"];
        return `family=${f.replace(/ /g, '+')}:wght@${weights.join(';')}`;
      }).join('&')}&display=swap`
    : null;

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // History state for Undo/Redo
  const [history, setHistory] = useState<CertificateDesignConfig[]>([parsedInitial]);
  const [historyIndex, setHistoryIndex] = useState(0);



  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

  const handleLayerDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLayerId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLayerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleLayerDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedLayerId || draggedLayerId === targetId) return;

    const elements = [...(design.canvasElements || [])];
    const draggedIdx = elements.findIndex(el => el.id === draggedLayerId);
    const targetIdx = elements.findIndex(el => el.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [draggedEl] = elements.splice(draggedIdx, 1);
    elements.splice(targetIdx, 0, draggedEl);

    applyDesignUpdate({ ...design, canvasElements: elements });
    setDraggedLayerId(null);
  };

  const moveLayerUp = () => {
    if (!selectedElementId) return;
    const idx = (design.canvasElements || []).findIndex(e => e.id === selectedElementId);
    if (idx < 0 || idx === (design.canvasElements || []).length - 1) return;
    const newElements = [...(design.canvasElements || [])];
    const temp = newElements[idx];
    newElements[idx] = newElements[idx + 1];
    newElements[idx + 1] = temp;
    applyDesignUpdate({ ...design, canvasElements: newElements });
  };

  const moveLayerDown = () => {
    if (!selectedElementId) return;
    const idx = (design.canvasElements || []).findIndex(e => e.id === selectedElementId);
    if (idx <= 0) return;
    const newElements = [...(design.canvasElements || [])];
    const temp = newElements[idx];
    newElements[idx] = newElements[idx - 1];
    newElements[idx - 1] = temp;
    applyDesignUpdate({ ...design, canvasElements: newElements });
  };

  const moveLayerToFront = () => {
    if (!selectedElementId) return;
    const idx = (design.canvasElements || []).findIndex(e => e.id === selectedElementId);
    if (idx < 0 || idx === (design.canvasElements || []).length - 1) return;
    const newElements = [...(design.canvasElements || [])];
    const el = newElements.splice(idx, 1)[0];
    newElements.push(el);
    applyDesignUpdate({ ...design, canvasElements: newElements });
  };

  const moveLayerToBack = () => {
    if (!selectedElementId) return;
    const idx = (design.canvasElements || []).findIndex(e => e.id === selectedElementId);
    if (idx <= 0) return;
    const newElements = [...(design.canvasElements || [])];
    const el = newElements.splice(idx, 1)[0];
    newElements.unshift(el);
    applyDesignUpdate({ ...design, canvasElements: newElements });
  };

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

  const handleOrientationChange = (newOrientation: "landscape" | "portrait") => {
    const currentOrientation = design.orientation || "landscape";
    if (currentOrientation === newOrientation) return;

    const oldIsPortrait = currentOrientation === 'portrait';
    const newIsPortrait = newOrientation === 'portrait';
    const oldW = oldIsPortrait ? 2480 : 3508;
    const oldH = oldIsPortrait ? 3508 : 2480;
    const newW = newIsPortrait ? 2480 : 3508;
    const newH = newIsPortrait ? 3508 : 2480;

    const scaleX = newW / oldW;
    const scaleY = newH / oldH;
    const scaleF = Math.min(scaleX, scaleY);

    const newElements = (design.canvasElements || []).map(el => ({
      ...el,
      x: el.x * scaleX,
      y: el.y * scaleY,
      width: el.width * scaleX,
      ...(el.height ? { height: el.height * scaleF } : {}),
      ...(el.fontSize ? { fontSize: el.fontSize * scaleX } : {})
    }));

    applyDesignUpdate({ ...design, orientation: newOrientation, canvasElements: newElements });
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

    const prevSelectedIdRef = useRef<string | null>(null);
  
  // Auto-switch to builder (Settings) tab when a NEW element is selected
  useEffect(() => {
    if (selectedElementId && selectedElementId !== prevSelectedIdRef.current) {
      if (activeTab !== "builder") {
        setPreviousTab(activeTab);
        setActiveTab("builder");
      }
    } else if (!selectedElementId && prevSelectedIdRef.current) {
      if (activeTab === "builder") {
        setActiveTab(previousTab);
      }
    }
    prevSelectedIdRef.current = selectedElementId;
  }, [selectedElementId]);

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
    } catch (err) { }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Template name is required.");
      setActiveTab("builder");
      setTimeout(() => alert("Please provide a Template Name before saving."), 10);
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
      x: type.includes("Text") || type === 'signature' ? 1500 : 830,
      y: 1000,
      width: (type === 'qrCode' || type === 'image' || type === 'badge') ? 368 : type === 'shape' ? 3000 : undefined,
      height: (type === 'qrCode' || type === 'image' || type === 'badge') ? 368 : type === 'shape' ? 6 : undefined,
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

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    if (!design.canvasElements) return;
    const updatedElements = design.canvasElements.map(el =>
      el.id === id ? { ...el, ...updates } : el
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

  useEffect(() => {
    if (selectedElement) {
      if (activePropTab === 'content' && (selectedElement.type === 'qrCode' || selectedElement.type === 'shape')) {
        setActivePropTab('style');
      } else if ((activePropTab === 'signature' || activePropTab === 'divider') && selectedElement.type !== 'signature') {
        setActivePropTab('style');
      } else if (activePropTab === 'style' && selectedElement.type === 'signature') {
        setActivePropTab('signature');
      } else if (activePropTab === 'style' && (selectedElement.type === 'image' || selectedElement.type === 'badge')) {
        setActivePropTab('content');
      }
    }
  }, [selectedElement?.type, activePropTab]);

  // Load a preset
  const loadPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const freshElements = (preset.design.canvasElements || []).map(el => ({
      ...el,
      id: uuidv4()
    }));

    const updated = {
      ...design,
      canvasElements: freshElements,
      backgroundImageUrl: preset.design.backgroundImageUrl
    };
    applyDesignUpdate(updated);
    setSelectedElementId(null);
  };

  // Responsive Canvas Scale State
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [userZoom, setUserZoom] = useState(1);
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  // Pan & Zoom Logic
  const [isPanMode, setIsPanMode] = useState(false);
  const [showPanTooltip, setShowPanTooltip] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isPanMode) setShowPanTooltip(true);
  }, [isPanMode]);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    if (userZoom <= 1) {
      setPanOffset({ x: 0, y: 0 });
      setIsPanMode(false);
    }
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const isPortrait = design.orientation === 'portrait';
      const canvasW = isPortrait ? 2480 : 3508;
      const canvasH = isPortrait ? 3508 : 2480;

      const visualW = canvasW * scale * userZoom;
      const visualH = canvasH * scale * userZoom;

      setHasOverflow(visualW > clientWidth || visualH > clientHeight);
    }
  }, [scale, userZoom, design.orientation]);

  const isDraggingCanvas = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isPanMode && hasOverflow) {
      isDraggingCanvas.current = true;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panOffset.x,
        panY: panOffset.y
      };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas.current && isPanMode && hasOverflow) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPanOffset({
        x: dragStart.current.panX + dx,
        y: dragStart.current.panY + dy
      });
    }
  };

  const handleCanvasMouseUp = () => {
    isDraggingCanvas.current = false;
  };

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        const availableW = width - 64; // 32px padding on each side
        const availableH = height - 64;
        const isPortrait = design.orientation === 'portrait';
        const canvasW = isPortrait ? 2480 : 3508;
        const canvasH = isPortrait ? 3508 : 2480;
        const scaleW = availableW / canvasW;
        const scaleH = availableH / canvasH;
        setScale(Math.min(scaleW, scaleH));
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [design.orientation]);

  return (
    <div className="flex-1 flex flex-col w-full px-4 sm:px-6 py-6 min-h-0 overflow-hidden">

      {googleFontsUrl && <link href={googleFontsUrl} rel="stylesheet" />}
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-6 shrink-0">
        <div>
          <Link href="/dashboard/templates" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Templates
          </Link>
          <div className="flex flex-col gap-1.5 w-full max-w-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600 shrink-0">
                <LayoutTemplate size={24} />
              </div>
              <input
                type="text"
                className={`text-2xl font-bold text-zinc-800 bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:outline-none transition-colors px-1 py-0.5 w-full ${error ? 'border-red-500 placeholder-red-300 text-red-600' : ''}`}
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError('');
                  if (!design.certificateTitle || design.certificateTitle === "Certificate of Completion")
                    updateDesignField("certificateTitle", e.target.value);
                }}
                placeholder="Name your template..."
                required
              />
            </div>
            <input
              type="text"
              className="text-zinc-500 text-sm font-medium bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:outline-none transition-colors px-1 py-0.5 w-full ml-12"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add an optional description..."
            />
          </div>
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



          <div className="relative flex items-center h-[38px] w-auto">
            <AnimatePresence mode="wait">
              {showResetConfirm ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.95, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.95, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center border border-red-200 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm h-[38px] origin-right whitespace-nowrap"
                >
                  <span className="text-sm font-medium text-red-600 bg-red-50/50 px-3 flex items-center h-full border-r border-red-100 whitespace-nowrap">
                    Reset All?
                  </span>
                  <button
                    onClick={() => {
                      applyDesignUpdate(defaultDesign);
                      setShowResetConfirm(false);
                    }}
                    className="px-4 hover:bg-red-50 text-red-600 transition-colors h-full flex items-center justify-center text-sm font-semibold border-r border-red-100 whitespace-nowrap"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 hover:bg-zinc-50 text-zinc-600 transition-colors h-full flex items-center justify-center text-sm font-medium whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="reset"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setShowResetConfirm(true)}
                  className="btn-secondary font-medium h-[38px] whitespace-nowrap"
                >
                  <RotateCcw size={16} /> <span className="hidden sm:inline">Reset</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <button onClick={handleSave} className="btn-primary font-medium min-w-[160px] justify-center" disabled={saving}>
            {saving ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : savedSuccess ? <><CheckCircle2 size={16} className="mr-2" /> Saved</> : <><Save size={16} className="mr-2" /> {isEdit ? "Update Template" : "Create Template"}</>}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden w-full max-w-none px-4 lg:px-0">

        {/* Canva-Style Far Left Toolbar (Tab Switcher) */}
        <div className="hidden lg:flex flex-col gap-2 w-20 shrink-0 bg-zinc-900 rounded-xl overflow-hidden shadow-sm py-4 items-center">

          <button onClick={() => setActiveTab("components")} className={`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors ${activeTab === 'components' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
            <LayoutTemplate size={20} />
            <span className="text-[10px] font-medium">Elements</span>
          </button>

          <button onClick={() => setActiveTab("background")} className={`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors ${activeTab === 'background' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
            <ImageIcon size={20} />
            <span className="text-[10px] font-medium">BG</span>
          </button>

          <button onClick={() => setActiveTab("builder")} className={`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors ${activeTab === 'builder' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
            <Layers size={20} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>

          <button onClick={() => setActiveTab("presets")} className={`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors ${activeTab === 'presets' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
            <LayoutTemplate size={20} />
            <span className="text-[10px] font-medium">Templates</span>
          </button>

          <button onClick={() => setActiveTab("json")} className={`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors ${activeTab === 'json' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
            <Code2 size={20} />
            <span className="text-[10px] font-medium">JSON</span>
          </button>

        </div>

        {/* Left: Administrative Controls */}
        <div className="w-full lg:w-[340px] lg:shrink-0 flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">


          <div className="flex-1 flex flex-col min-h-0 overflow-x-hidden">
              {/* TAB: Components */}
              {activeTab === "components" ? (
                <motion.div
                  key="components"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 p-6 flex-1 w-full overflow-y-auto"
                >
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-800 px-1">Add Design Elements</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => addElement("staticText", "New Heading")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors bg-white">
                        <Type size={24} />
                        <span className="text-xs font-medium">Text</span>
                      </button>
                      <button onClick={() => addElement("dynamicText", "recipientName")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors bg-white">
                        <Database size={24} />
                        <span className="text-xs font-medium">Data Field</span>
                      </button>
                      <button onClick={() => addElement("signature", "Signatory Name|Title Here")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors bg-white">
                        <Stamp size={24} />
                        <span className="text-xs font-medium">Signature</span>
                      </button>
                      <button onClick={() => addElement("badge")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors bg-white">
                        <ShieldCheck size={24} />
                        <span className="text-xs font-medium">Badge</span>
                      </button>
                      <button onClick={() => addElement("image")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors bg-white">
                        <ImageIcon size={24} />
                        <span className="text-xs font-medium">Image</span>
                      </button>
                      <button onClick={() => addElement("shape")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors bg-white">
                        <Minus size={24} />
                        <span className="text-xs font-medium">Divider</span>
                      </button>
                      <button onClick={() => addElement("qrCode")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors bg-white col-span-2">
                        <QrCode size={24} />
                        <span className="text-xs font-medium">QR Code</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === "background" ? (
                <motion.div
                  key="background"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 p-6 flex-1 w-full overflow-y-auto"
                >
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-zinc-800 px-1">Canvas Background</h3>

                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon size={24} className="mb-2 text-zinc-400" />
                          <p className="text-xs text-zinc-500"><span className="font-semibold text-zinc-600">Click to upload</span> or drag</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => applyDesignUpdate({ ...design, backgroundImageUrl: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-zinc-600 px-1">Or paste image URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com/bg.jpg"
                        className="input-field py-2 text-sm w-full"
                        value={design.backgroundImageUrl && design.backgroundImageUrl.startsWith('http') ? design.backgroundImageUrl : ''}
                        onChange={(e) => applyDesignUpdate({ ...design, backgroundImageUrl: e.target.value })}
                      />
                    </div>

                    {design.backgroundImageUrl && (
                      <button onClick={() => updateDesignField("backgroundImageUrl", null)} className="text-sm font-medium text-red-600 w-full text-center hover:bg-red-50 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100">
                        Remove Background
                      </button>
                    )}


                    <div className="pt-2 border-t border-zinc-200 space-y-6 pb-20">
                      {PRESET_CATEGORIES.map((category, idx) => (
                        <div key={idx} className="space-y-3">
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            {category.orientation === 'portrait' ? <span className="w-1.5 h-2.5 border border-current rounded-[1px] opacity-70"></span> : <span className="w-2.5 h-1.5 border border-current rounded-[1px] opacity-70"></span>}
                            {category.name}
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {category.items.map((bg) => (
                              <button
                                key={bg.id}
                                onClick={() => {
                                  if (design.orientation !== category.orientation) {
                                    // First trigger orientation change which will flip coords
                                    handleOrientationChange(category.orientation);
                                  }
                                  // Then apply background
                                  setTimeout(() => applyDesignUpdate({ ...design, orientation: category.orientation, backgroundImageUrl: bg.url }), 50);
                                }}
                                className={`relative ${category.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'} rounded-lg overflow-hidden border-2 transition-all ${design.backgroundImageUrl === bg.url ? 'border-zinc-900 shadow-md scale-[1.02]' : 'border-transparent hover:border-zinc-300 hover:scale-[1.02]'}`}
                                title={bg.name}
                              >
                                <img src={bg.url} alt={bg.name} className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
                                  <p className="text-[9px] font-medium text-white truncate text-center drop-shadow-sm">{bg.name}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === "presets" ? (
                <motion.div
                  key="presets"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 p-6 flex-1 w-full overflow-y-auto"
                >
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-800 px-1">Starting Templates</h3>
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
                </motion.div>
              ) : activeTab === "builder" ? (
                <motion.div
                  key="builder"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full w-full flex-1 min-h-0"
                >





                  
                  {/* Element Properties */}
                  {selectedElement ? (
                    <div className="flex flex-col h-full relative">
                        {/* Fixed Header & Tabs Container */}
                        <div className="bg-white z-20 pt-6 px-6 pb-0 border-b border-zinc-200 shrink-0">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center border border-zinc-200">
                              {selectedElement.type === "staticText" ? <Type size={18} /> : selectedElement.type === "dynamicText" ? <Database size={18} /> : selectedElement.type === "signature" ? <Stamp size={18} /> : selectedElement.type === "badge" ? <ShieldCheck size={18} /> : selectedElement.type === "shape" ? <Minus size={18} /> : selectedElement.type === "qrCode" ? <QrCode size={18} /> : <ImageIcon size={18} />}
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-zinc-900 capitalize leading-tight">{ELEMENT_FRIENDLY_NAMES[selectedElement.type] || selectedElement.type}</h4>
                              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">Element Settings</p>
                            </div>
                          </div>
                          <button onClick={deleteSelectedElement} className="text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors p-2 rounded-lg border border-transparent hover:border-red-100" title="Delete Element">
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Global Tabs Navigation */}
                        <div className="flex gap-4 relative overflow-x-auto no-scrollbar">
                          {selectedElement.type !== 'qrCode' && selectedElement.type !== 'shape' && (
                            <button onClick={() => setActivePropTab('content')} className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${activePropTab === 'content' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                            Content
                            {activePropTab === 'content' && <motion.div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-zinc-900 z-10" />}
                          </button>
                          )}
                          
                          {selectedElement.type === 'signature' ? (
                            <>
                              <button onClick={() => setActivePropTab('signature')} className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${activePropTab === 'signature' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                Fonts
                                {activePropTab === 'signature' && <motion.div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-zinc-900 z-10" />}
                              </button>
                              <button onClick={() => setActivePropTab('divider')} className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${activePropTab === 'divider' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                Divider Line
                                {activePropTab === 'divider' && <motion.div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-zinc-900 z-10" />}
                              </button>
                              
                            </>
                          ) : selectedElement.type !== 'image' && selectedElement.type !== 'badge' ? (
                            <button onClick={() => setActivePropTab('style')} className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${activePropTab === 'style' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                              Style
                              {activePropTab === 'style' && <motion.div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-zinc-900 z-10" />}
                            </button>
                          ) : null}
                          
                          <button onClick={() => setActivePropTab('layout')} className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${activePropTab === 'layout' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                            Layout
                            {activePropTab === 'layout' && <motion.div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-zinc-900 z-10" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="space-y-6 p-6 pb-20">
                        
                        {/* ----------------- CONTENT TAB ----------------- */}
                        {activePropTab === 'content' && (
                          <div className="space-y-4">
                            {selectedElement.type.includes("Text") && (
                              <>
                                {selectedElement.type === "dynamicText" ? (
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Dynamic Field Mapping</label>
                                    <Select
                                      value={selectedElement.text || ""}
                                      onChange={(val) => updateSelectedElement({ text: val })}
                                      options={[
                                        { value: "recipientName", label: "Recipient Name" },
                                        { value: "role", label: "Role / Title / Degree" },
                                        { value: "eventName", label: "Event Description" },
                                        { value: "issueDate", label: "Issue Date" },
                                        { value: "certificateId", label: "Certificate ID / Serial No." },
                                      ]}
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Text Content</label>
                                    <textarea
                                      className="input-field py-2 text-sm"
                                      value={selectedElement.text}
                                      onChange={(e) => updateSelectedElement({ text: e.target.value })}
                                      rows={3}
                                    />
                                  </div>
                                )}
                              </>
                            )}

                            {selectedElement.type === "signature" && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Signatory Name</label>
                                  <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="input-field py-2 text-sm w-full"
                                    value={selectedElement.signatoryName ?? (selectedElement.text?.split('|')[0] || "")}
                                    onChange={(e) => updateSelectedElement({ signatoryName: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Signatory Title</label>
                                  <input
                                    type="text"
                                    placeholder="CEO & Founder"
                                    className="input-field py-2 text-sm w-full"
                                    value={selectedElement.signatoryTitle ?? (selectedElement.text?.split('|')[1] || "")}
                                    onChange={(e) => updateSelectedElement({ signatoryTitle: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Graphic Override</label>
                                  <label className="btn-secondary w-full justify-center cursor-pointer text-xs py-2 border-dashed">
                                    <ImageIcon size={14} className="mr-1.5 text-zinc-500" /> Upload Image instead
                                    <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const reader = new FileReader();
                                      reader.onload = (event) => updateSelectedElement({ src: event.target?.result as string });
                                      reader.readAsDataURL(file);
                                    }} className="hidden" />
                                  </label>
                                  {selectedElement.src && (
                                    <button onClick={() => updateSelectedElement({ src: undefined })} className="text-[10px] font-medium text-red-500 w-full text-center hover:text-red-700 transition-colors mt-2">Remove Graphic</button>
                                  )}
                                </div>
                              </div>
                            )}

                            {(selectedElement.type === "image" || selectedElement.type === "badge") && (
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">{selectedElement.type === "badge" ? "Custom Seal Graphic" : "Image Asset"}</label>
                                <label className="btn-secondary w-full justify-center cursor-pointer text-sm py-3 border-dashed bg-zinc-50 hover:bg-zinc-100">
                                  <ImageIcon size={16} className="mr-2 text-zinc-500" /> Upload File
                                  <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (event) => updateSelectedElement({ src: event.target?.result as string });
                                    reader.readAsDataURL(file);
                                  }} className="hidden" />
                                </label>
                                {selectedElement.src && (
                                  <button onClick={() => updateSelectedElement({ src: undefined })} className="text-[10px] font-medium text-red-500 w-full text-center hover:text-red-700 transition-colors mt-2">Remove File</button>
                                )}
                              </div>
                            )}

                            {selectedElement.type === "shape" && (
                              <div className="text-xs text-zinc-500 italic">No content properties for shapes. Use the Style tab to change colors.</div>
                            )}
                          </div>
                        )}

                        {/* ----------------- SIGNATURE TAB ----------------- */}
                        {activePropTab === 'signature' && selectedElement.type === 'signature' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Font Family</label>
                                <Select
                                  value={selectedElement.fontFamily || "var(--font-script, cursive)"}
                                  onChange={(val) => updateSelectedElement({ fontFamily: val })}
                                  options={[
                                    { value: "var(--font-script, cursive)", label: "Cursive (Default)" },
                                    { value: "Great Vibes", label: "Great Vibes" },
                                    { value: "Dancing Script", label: "Dancing Script" },
                                    { value: "Pacifico", label: "Pacifico" },
                                    { value: "Caveat", label: "Caveat" },
                                    { value: "Inter", label: "Inter (Sans)" },
                                    { value: "Playfair Display", label: "Playfair (Serif)" }
                                  ]}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Size (pt)</label>
                                <FontSizeSelector value={selectedElement.fontSize || 16} onChange={(val) => updateSelectedElement({ fontSize: val })} />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Ink Color</label>
                                <ColorSelector value={selectedElement.color || "#000000"} onChange={(val) => updateSelectedElement({ color: val })} />
                              </div>
                            
                              <div className="col-span-2 pt-4 border-t border-zinc-200 mt-2">
                                <h6 className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 mb-4">Title Font</h6>
                              </div>

                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Title Font Family</label>
                                <Select
                                  value={selectedElement.titleFontFamily || "var(--font-sans, sans-serif)"}
                                  onChange={(val) => updateSelectedElement({ titleFontFamily: val })}
                                  options={[
                                    { value: "var(--font-sans, sans-serif)", label: "System Sans (Default)" },
                                    { value: "Arial", label: "Arial" },
                                    { value: "Inter", label: "Inter" },
                                    { value: "Playfair Display", label: "Playfair Display" }
                                  ]}
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                                  <span>Scale Multiplier</span>
                                  <span className="text-zinc-900">{selectedElement.titleFontSize || 0.4}x</span>
                                </label>
                                <input 
                                  type="range" 
                                  min="0.2" max="1" step="0.05"
                                  value={selectedElement.titleFontSize || 0.4} 
                                  onChange={(e) => updateSelectedElement({ titleFontSize: parseFloat(e.target.value) })}
                                  className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer" 
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                                  <span>Letter Spacing</span>
                                  <span className="text-zinc-900">{selectedElement.titleLetterSpacing ?? 4}px</span>
                                </label>
                                <input 
                                  type="range" 
                                  min="0" max="20" step="1"
                                  value={selectedElement.titleLetterSpacing ?? 4} 
                                  onChange={(e) => updateSelectedElement({ titleLetterSpacing: parseInt(e.target.value) })}
                                  className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer" 
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Title Color</label>
                                <ColorSelector value={selectedElement.titleColor || selectedElement.color || "#000000"} onChange={(val) => updateSelectedElement({ titleColor: val })} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ----------------- DIVIDER TAB ----------------- */}
                        {activePropTab === 'divider' && selectedElement.type === 'signature' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-end border-b border-zinc-200 pb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-medium text-zinc-500 uppercase">Hide</span>
                                <button 
                                  onClick={() => updateSelectedElement({ hideLine: !selectedElement.hideLine })}
                                  className={`w-7 h-4 rounded-full transition-colors relative ${selectedElement.hideLine ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                                >
                                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${selectedElement.hideLine ? 'left-[14px]' : 'left-[2px]'}`} />
                                </button>
                              </div>
                            </div>
                            {!selectedElement.hideLine && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <label className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                                    <span>Thickness</span>
                                    <span className="text-zinc-900">{selectedElement.lineThickness || 4}px</span>
                                  </label>
                                  <input 
                                    type="range" 
                                    min="1" max="10" 
                                    value={selectedElement.lineThickness || 4} 
                                    onChange={(e) => updateSelectedElement({ lineThickness: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer" 
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Padding</label>
                                  <input
                                    type="number"
                                    value={selectedElement.linePadding ?? 10}
                                    onChange={(e) => updateSelectedElement({ linePadding: parseInt(e.target.value) || 0 })}
                                    className="input-field py-1 text-sm w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Line Color</label>
                                  <ColorSelector value={selectedElement.lineColor || selectedElement.color || "#000000"} onChange={(val) => updateSelectedElement({ lineColor: val })} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        

                        {/* ----------------- STYLE TAB ----------------- */}
                        {activePropTab === 'style' && selectedElement.type !== 'signature' && (
                          <div className="space-y-6">
                            {/* Typography Group (For Text & Signature) */}
                            {selectedElement.type.includes("Text") && (
                              <div className="space-y-4">
                                <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1">Typography</h5>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Font Family</label>
                                    <Select
                                      value={selectedElement.fontFamily || (selectedElement.type === 'signature' ? "var(--font-script, cursive)" : "var(--font-sans, sans-serif)")}
                                      onChange={(val) => updateSelectedElement({ fontFamily: val })}
                                      options={
                                        selectedElement.type === 'signature' 
                                        ? [
                                            { value: "var(--font-script, cursive)", label: "Cursive (Default)" },
                                            { value: "Great Vibes", label: "Great Vibes" },
                                            { value: "Dancing Script", label: "Dancing Script" },
                                            { value: "Pacifico", label: "Pacifico" },
                                            { value: "Caveat", label: "Caveat" },
                                            { value: "Inter", label: "Inter (Sans)" },
                                            { value: "Playfair Display", label: "Playfair (Serif)" }
                                          ]
                                        : [
                                            { value: "system-group", label: "System Basics", isGroupLabel: true },
                                            { value: "Arial", label: "Arial (System)" },
                                            { value: "var(--font-sans, sans-serif)", label: "System Default" },
                                            ...GOOGLE_FONTS.flatMap(group => [
                                              { value: `group-${group.group}`, label: group.group, isGroupLabel: true },
                                              ...group.fonts.map(font => ({ value: font, label: font }))
                                            ])
                                          ]
                                      }
                                    />
                                  </div>

                                  {!selectedElement.type.includes("signature") && (
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Font Weight</label>
                                      <Select
                                        value={selectedElement.fontWeight || "normal"}
                                        onChange={(val) => updateSelectedElement({ fontWeight: val })}
                                        options={(FONT_SUPPORTED_WEIGHTS[
                                          selectedElement.fontFamily === 'var(--font-sans, sans-serif)' ? 'Arial' :
                                          selectedElement.fontFamily === 'var(--font-script, cursive)' ? 'Great Vibes' :
                                          selectedElement.fontFamily === 'Arial' ? 'Arial' :
                                          selectedElement.fontFamily || 'Inter'
                                        ] || ["400", "700"]).map(w => {
                                          let val = w;
                                          if (w === "400") val = "normal";
                                          if (w === "700") val = "bold";
                                          const labels: any = {
                                            "100": "Thin", "200": "Extra Light", "300": "Light", "400": "Regular",
                                            "500": "Medium", "600": "Semi Bold", "700": "Bold", "800": "Extra Bold", "900": "Black"
                                          };
                                          return { value: val, label: `${labels[w]} (${w})` };
                                        })}
                                      />
                                    </div>
                                  )}

                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">{selectedElement.type === 'signature' ? 'Master Size' : 'Size (pt)'}</label>
                                    <FontSizeSelector value={selectedElement.fontSize || 16} onChange={(val) => updateSelectedElement({ fontSize: val })} />
                                  </div>
                                </div>

                                
                                                        {/* Text Tools (Alignment & Style) */}
                                {!selectedElement.type.includes("signature") && (
                                  <div className="flex gap-2">
                                    <div className="flex border border-zinc-200 rounded-lg bg-zinc-50 overflow-hidden shadow-sm h-8">
                                      <button title="Align Left" className={`px-2.5 transition-colors ${selectedElement.align === 'left' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`} onClick={() => updateSelectedElement({ align: 'left' })}><AlignLeft size={14} /></button>
                                      <div className="w-px bg-zinc-200"></div>
                                      <button title="Align Center" className={`px-2.5 transition-colors ${selectedElement.align === 'center' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`} onClick={() => updateSelectedElement({ align: 'center' })}><AlignCenter size={14} /></button>
                                      <div className="w-px bg-zinc-200"></div>
                                      <button title="Align Right" className={`px-2.5 transition-colors ${selectedElement.align === 'right' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`} onClick={() => updateSelectedElement({ align: 'right' })}><AlignRight size={14} /></button>
                                    </div>
                                    <div className="flex border border-zinc-200 rounded-lg bg-zinc-50 overflow-hidden shadow-sm h-8">
                                      <button title="Italic" className={`px-2.5 transition-colors ${selectedElement.fontStyle === 'italic' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`} onClick={() => updateSelectedElement({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}><Italic size={14} /></button>
                                    </div>
                                    <div className="flex-1">
                                      <Select
                                        value={selectedElement.textTransform || "none"}
                                        onChange={(val) => updateSelectedElement({ textTransform: val as any })}
                                        options={[
                                          { value: "none", label: "Aa" },
                                          { value: "uppercase", label: "AA" },
                                          { value: "lowercase", label: "aa" },
                                          { value: "capitalize", label: "Aa Bb" },
                                        ]}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}



{/* Color Group */}
                            <div className="space-y-4">
                              <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1">Colors</h5>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Primary Fill</label>
                                <ColorSelector value={selectedElement.color || "#000000"} onChange={(val) => updateSelectedElement({ color: val })} />
                              </div>
                            </div>

                            {/* Spacing & Details */}
                            {selectedElement.type.includes("Text") && (
                              <div className="space-y-4">
                                <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1">Spacing</h5>
                                
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Letter spacing</label>
                                  <div className="flex items-center gap-3">
                                    <input type="range" min="-10" max="50" step="1" className="flex-1 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm" value={selectedElement.letterSpacing || 0} onChange={(e) => updateSelectedElement({ letterSpacing: Number(e.target.value) })} />
                                    <input type="number" className="input-field h-8 w-14 text-center text-xs font-mono" value={selectedElement.letterSpacing || 0} onChange={(e) => updateSelectedElement({ letterSpacing: Number(e.target.value) })} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Line spacing</label>
                                  <div className="flex items-center gap-3">
                                    <input type="range" min="0.5" max="3" step="0.1" className="flex-1 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm" value={selectedElement.lineSpacing || 1.2} onChange={(e) => updateSelectedElement({ lineSpacing: Number(e.target.value) })} />
                                    <input type="number" min="0.5" max="3" step="0.1" className="input-field h-8 w-14 text-center text-xs font-mono" value={selectedElement.lineSpacing || 1.2} onChange={(e) => updateSelectedElement({ lineSpacing: Number(e.target.value) })} />
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedElement.type === "signature" && (
                              <>
                                <div className="space-y-4">
                                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1">Divider Line</h5>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Thickness (px)</label>
                                      <input type="number" min="0" max="20" className="input-field h-8 w-full text-xs font-mono" value={selectedElement.lineThickness ?? 4} onChange={(e) => updateSelectedElement({ lineThickness: Number(e.target.value) })} />
                                    </div>
                                    <div className="col-span-2">
                                      <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Gap / Padding</label>
                                      <div className="flex items-center gap-3">
                                        <input type="range" min="0" max="50" className="flex-1 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm" value={selectedElement.linePadding ?? 10} onChange={(e) => updateSelectedElement({ linePadding: Number(e.target.value) })} />
                                        <input type="number" min="0" max="50" className="input-field h-8 w-14 text-center text-xs font-mono" value={selectedElement.linePadding ?? 10} onChange={(e) => updateSelectedElement({ linePadding: Number(e.target.value) })} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1">Title Typography</h5>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Title Font</label>
                                    <Select
                                      value={selectedElement.titleFontFamily || "var(--font-sans, sans-serif)"}
                                      onChange={(val) => updateSelectedElement({ titleFontFamily: val })}
                                      options={[
                                        { value: "var(--font-sans, sans-serif)", label: "Sans (Default)" },
                                        { value: "var(--font-serif, serif)", label: "Serif (Default)" },
                                        { value: "Inter", label: "Inter" },
                                        { value: "Roboto", label: "Roboto" },
                                        { value: "Playfair Display", label: "Playfair Display" },
                                      ]}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Scale multiplier</label>
                                      <input type="number" step="0.1" className="input-field h-8 w-full text-xs font-mono" value={selectedElement.titleFontSize ?? 0.4} onChange={(e) => updateSelectedElement({ titleFontSize: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Tracking (px)</label>
                                      <input type="number" step="1" className="input-field h-8 w-full text-xs font-mono" value={selectedElement.titleLetterSpacing ?? 4} onChange={(e) => updateSelectedElement({ titleLetterSpacing: Number(e.target.value) })} />
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                          </div>
                        )}

                        {/* ----------------- LAYOUT TAB ----------------- */}
                        {activePropTab === 'layout' && (
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1">Positioning</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">X Axis</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">X</span>
                                    <input type="number" className="input-field h-9 pl-7 pr-2 w-full text-sm font-mono" value={selectedElement.x ?? ""} onChange={(e) => updateSelectedElement({ x: Number(e.target.value) })} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Y Axis</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">Y</span>
                                    <input type="number" className="input-field h-9 pl-7 pr-2 w-full text-sm font-mono" value={selectedElement.y ?? ""} onChange={(e) => updateSelectedElement({ y: Number(e.target.value) })} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1">Dimensions</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Width</label>
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">W</span>
                                      <input 
                                        type="number" 
                                        className="input-field h-9 pl-7 pr-2 w-full text-sm font-mono" 
                                        placeholder="Auto" 
                                        value={selectedElement.width || ""} 
                                        onChange={(e) => updateSelectedElement({ width: e.target.value === '' ? undefined : Number(e.target.value) })} 
                                      />
                                    </div>
                                    <button 
                                      onClick={() => updateSelectedElement({ width: undefined })}
                                      className={`px-4 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${!selectedElement.width ? 'bg-zinc-200 text-zinc-950 border-zinc-300' : 'bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100'}`}
                                    >
                                      Auto
                                    </button>
                                  </div>
                                </div>
                                
                                {!(selectedElement.type.includes("Text") || selectedElement.type === "signature") && (
                                  <div className="col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Height</label>
                                    <div className="relative flex-1">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">H</span>
                                      <input 
                                        type="number" 
                                        className="input-field h-9 pl-7 pr-2 w-full text-sm font-mono" 
                                        placeholder="Auto" 
                                        value={selectedElement.height || ""} 
                                        onChange={(e) => updateSelectedElement({ height: e.target.value === '' ? undefined : Number(e.target.value) })} 
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                    </div>
                  ) : (
                    <div className="text-center p-12 border border-dashed border-zinc-300 rounded-xl bg-zinc-50 text-zinc-400 flex flex-col items-center justify-center h-[300px]">
                      <MousePointer2 size={32} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium text-zinc-600">No element selected</p>
                      <p className="text-xs mt-1 text-zinc-400 max-w-[200px]">Click an element on the canvas to configure its properties here.</p>
                    </div>
                  )}


                </motion.div>
              ) : (
                <motion.div
                  key="json"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
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
          </div>

        </div>

        {/* Right: Live Canvas Builder */}
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">

          {/* Pan Mode Notification */}
          <AnimatePresence>
            {isPanMode && showPanTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -10, x: 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -10, x: 10 }}
                className="absolute top-4 right-4 z-[120] bg-white/70 backdrop-blur-sm border border-zinc-200 text-zinc-500 text-xs pl-3 pr-1 py-1 rounded-md flex items-center gap-3 font-medium pointer-events-auto"
              >
                <div className="flex items-center gap-1.5 pointer-events-none">
                  <Hand size={14} className="opacity-70" />
                  Double-click to disable
                </div>
                <button
                  onClick={() => setShowPanTooltip(false)}
                  className="p-1 hover:bg-zinc-200/50 rounded-md transition-colors"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>



          <div
            ref={containerRef}
            className={`flex-1 min-h-0 relative flex items-center justify-center bg-zinc-200/50 overflow-hidden ${isPanMode && hasOverflow ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onClick={(e) => { if (e.target === e.currentTarget && !isPanMode) setSelectedElementId(null); }}
            onDoubleClick={(e) => {
              if (hasOverflow) {
                setIsPanMode(!isPanMode);
              }
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {isPanMode && hasOverflow && (
              <div className="absolute inset-0 z-[100] pointer-events-auto" />
            )}

            <div
              className="shrink-0 relative bg-white shadow-md border border-zinc-200"
              style={{
                width: design.orientation === 'portrait' ? '2480px' : '3508px',
                height: design.orientation === 'portrait' ? '3508px' : '2480px',
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale * userZoom})`,
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
                    updateElement={updateElement}
                    setActiveGuides={setActiveGuides}
                    currentOrientation={design.orientation || 'landscape'}
                    scale={scale * userZoom}
                    isPanMode={isPanMode}
                    dummyQrCode={dummyQrCode}
                  />
                );
              })}
            </div>

            {/* Interactive Zoom Controls */}
            <div className="absolute bottom-4 right-4 z-[110] flex flex-col items-end">

              {/* Layers Popup */}
              <AnimatePresence>
                {showLayersPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="mb-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl w-[260px] overflow-hidden pointer-events-auto"
                  >
                    <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                      <h4 className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                        <Layers size={14} className="text-zinc-500" /> Canvas Layers
                      </h4>
                      <button onClick={() => setShowLayersPanel(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="p-2 space-y-1.5 max-h-[300px] overflow-y-auto">
                      {!design.canvasElements || design.canvasElements.length === 0 ? (
                        <p className="text-[11px] text-zinc-400 text-center py-4">No elements yet</p>
                      ) : (
                        [...(design.canvasElements || [])].reverse().map((el, reversedIdx) => {
                          const idx = design.canvasElements!.length - 1 - reversedIdx;
                          const isSelected = selectedElementId === el.id;
                          let label: string = el.type;
                          if (label === 'staticText') label = el.text ? `"${el.text.substring(0, 15)}..."` : 'Text';
                          else if (label === 'dynamicText') label = `Data: ${el.text}`;
                          else if (label === 'badge') label = 'Badge';
                          else if (label === 'image') label = 'Image';
                          else if (label === 'qrCode') label = 'QR Code';
                          else if (label === 'signature') label = 'Signature';

                          return (
                            <div
                              key={el.id}
                              draggable
                              onDragStart={(e) => handleLayerDragStart(e, el.id)}
                              onDragOver={handleLayerDragOver}
                              onDrop={(e) => handleLayerDrop(e, el.id)}
                              onDragEnd={() => setDraggedLayerId(null)}
                              className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-grab active:cursor-grabbing transition-colors ${isSelected ? 'bg-zinc-100 text-zinc-950 shadow-sm border border-zinc-200/50' : 'bg-transparent hover:bg-zinc-100 text-zinc-600 border border-transparent'} ${draggedLayerId === el.id ? 'opacity-40 border-dashed border-zinc-400' : ''}`}
                              onClick={() => setSelectedElementId(el.id)}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className={`w-4 h-4 flex items-center justify-center rounded text-[9px] font-mono ${isSelected ? 'bg-zinc-300/50 text-zinc-900' : 'bg-zinc-200/50 text-zinc-400'}`}>
                                  {idx + 1}
                                </div>
                                <span className={`truncate font-medium ${el.locked ? 'text-zinc-400' : ''}`}>{label}</span>
                              </div>

                              <div className="flex items-center shrink-0 gap-1">
                                <button onClick={(e) => { 
                                  e.stopPropagation(); 
                                  updateElement(el.id, { locked: !el.locked }); 
                                  if (!el.locked && selectedElementId === el.id) setSelectedElementId(null);
                                }} className={`p-1 rounded transition-colors ${el.locked ? 'text-amber-500 hover:bg-amber-100' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 opacity-0 group-hover:opacity-100'}`} title={el.locked ? "Unlock layer" : "Lock layer"}>
                                  {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                                </button>
                                {isSelected && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); moveLayerUp(); }} disabled={idx === design.canvasElements!.length - 1} className="p-1 hover:bg-zinc-300/50 rounded text-zinc-900 disabled:opacity-30 transition-colors" title="Bring Forward">
                                      <ArrowUp size={12} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); moveLayerDown(); }} disabled={idx === 0} className="p-1 hover:bg-zinc-300/50 rounded text-zinc-900 disabled:opacity-30 transition-colors" title="Send Backward">
                                      <ArrowDown size={12} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1 pointer-events-auto">
                <button
                  onClick={() => setShowLayersPanel(!showLayersPanel)}
                  className={`p-1 mr-1 rounded transition-colors flex items-center justify-center ${showLayersPanel ? 'bg-zinc-200 text-zinc-950' : 'hover:bg-zinc-100 text-zinc-600'}`}
                  title="Layers Panel"
                >
                  <Layers size={14} />
                </button>
                <div className="w-[1px] h-4 bg-zinc-200 mx-1"></div>
                {hasOverflow && (
                  <button
                    onClick={() => setIsPanMode(!isPanMode)}
                    className={`p-1 mr-1 rounded transition-colors ${isPanMode ? 'bg-zinc-200 text-zinc-950' : 'hover:bg-zinc-100 text-zinc-600'}`}
                    title="Toggle Pan Mode (Double-click canvas to quickly toggle)"
                  >
                    <Hand size={14} />
                  </button>
                )}
                <button onClick={() => setUserZoom(p => Math.max(0.1, p - (0.1 / scale)))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom Out">
                  <Minus size={14} />
                </button>
                <button onClick={() => setUserZoom(1)} className="px-2 py-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors text-xs font-medium w-[140px] text-center" title="Reset Zoom">
                  {design.orientation === 'portrait' ? '2480 x 3508' : '3508 x 2480'} ({Math.round(scale * userZoom * 100)}%)
                </button>
                <button onClick={() => setUserZoom(p => Math.min(20, p + (0.1 / scale)))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom In">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        );
}

function CanvasDraggableElement({ el, isSelected, displayText, setSelectedElementId, updateSelectedElement, updateElement, setActiveGuides, currentOrientation, scale, dummyQrCode, isPanMode }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const dragStartData = useRef({ width: 0, fontSize: 0 });

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (el.type === 'staticText' || el.type === 'dynamicText' || el.type === 'signature') {
      setIsEditing(true);
    }
  };

  const isProportional = el.type === 'qrCode' || el.type === 'image' || el.type === 'badge';

  return (
    <Rnd
      id={`rnd-${el.id}`}
      size={{ 
        width: (el.type === 'signature' && !el.src) ? 'auto' : (el.width || 'auto'), 
        height: (el.type === 'signature' && !el.src) ? 'auto' : (el.height || 'auto') 
      }}
      position={{ x: el.x, y: el.y }}
      onDragStart={() => {
        if (el.locked) return;
        if (!isSelected) setSelectedElementId(el.id);
      }}
      onDragStop={(e, data) => {
        const canvasWidth = currentOrientation === 'landscape' ? 1122 : 793;
        const canvasHeight = currentOrientation === 'landscape' ? 793 : 1122;
        const elW = data.node.offsetWidth;
        const elH = data.node.offsetHeight;
        let finalX = data.x;
        let finalY = data.y;
        const centerX = data.x + elW / 2;
        const centerY = data.y + elH / 2;
        if (Math.abs(centerX - canvasWidth / 2) < 15) finalX = canvasWidth / 2 - elW / 2;
        if (Math.abs(centerY - canvasHeight / 2) < 15) finalY = canvasHeight / 2 - elH / 2;
        setActiveGuides({ vertical: null, horizontal: null });
        updateElement(el.id, { x: finalX, y: finalY });
      }}
      onResizeStart={(e, dir, ref) => {
        if (!isSelected) setSelectedElementId(el.id);
        const defaultFontSize = el.type === 'signature' ? 120 : 16;
        dragStartData.current = { width: ref.offsetWidth, fontSize: el.fontSize || defaultFontSize };
      }}
      onResize={(e, direction, ref, delta, position) => {
        const newWidth = parseFloat(ref.style.width);
        const newHeight = el.height ? parseFloat(ref.style.height) : undefined;

        let updates: any = { x: position.x, y: position.y };

        const isCorner = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(direction);
        if (isCorner && !isProportional && el.type !== 'shape') {
          const startW = dragStartData.current.width || 1;
          const defaultFontSize = el.type === 'signature' ? 120 : 16;
          const startFs = dragStartData.current.fontSize || defaultFontSize;
          const ratio = newWidth / startW;
          updates.fontSize = Math.max(8, Math.round(startFs * ratio));
        }

        updates.width = (el.type === 'signature' && !el.src) ? ref.offsetWidth : newWidth;
        if (newHeight !== undefined) updates.height = (el.type === 'signature' && !el.src) ? ref.offsetHeight : newHeight;

        updateSelectedElement(updates);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        // Final sync just in case
        const newWidth = parseFloat(ref.style.width);
        const newHeight = el.height ? parseFloat(ref.style.height) : undefined;
        let updates: any = { x: position.x, y: position.y };

        const isCorner = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(direction);
        if (isCorner && !isProportional && el.type !== 'shape') {
          const startW = dragStartData.current.width || 1;
          const defaultFontSize = el.type === 'signature' ? 120 : 16;
          const startFs = dragStartData.current.fontSize || defaultFontSize;
          const ratio = newWidth / startW;
          updates.fontSize = Math.max(8, Math.round(startFs * ratio));
        }

        updates.width = (el.type === 'signature' && !el.src) ? ref.offsetWidth : newWidth;
        if (newHeight !== undefined) updates.height = (el.type === 'signature' && !el.src) ? ref.offsetHeight : newHeight;

        updateSelectedElement(updates);
      }}
      scale={scale}
      bounds="parent"
      disableDragging={isEditing || isPanMode || el.locked}
      onClick={(e: any) => {
        e.stopPropagation();
        if (el.locked) return;
        setSelectedElementId(el.id);
      }}
      style={{
        pointerEvents: el.locked ? "none" : "auto",
        cursor: el.locked ? "default" : isEditing ? "text" : "move",
        border: isSelected ? "2px solid #3b82f6" : "1px dashed transparent",
        padding: "2px",
        fontSize: `${el.fontSize || 16}px`,
        fontFamily: el.fontFamily || "var(--font-sans, sans-serif)",
        color: el.color || "#000000",
        textAlign: (el.align as any) || "left",
        fontWeight: el.fontWeight || "normal",
        fontStyle: el.fontStyle || "normal",
        letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : "normal",
        textTransform: el.textTransform as any || "none",
        lineHeight: el.lineSpacing || 1.2,
        whiteSpace: "pre-wrap",
        zIndex: isSelected ? 50 : 10,
        backgroundColor: el.type === 'shape' ? (el.color || '#000000') : 'transparent',
        display: "flex",
        alignItems: "center"
      }}
      className={`${isSelected ? "bg-blue-50/10 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]" : "hover:border-zinc-300"}`}
      enableResizing={
        el.locked 
          ? false 
          : isSelected && !isEditing 
            ? (el.type === 'signature' && !el.src 
                ? false 
                : true)
            : false
      }
      lockAspectRatio={isProportional}
      resizeHandleStyles={{
        bottomRight: { width: "16px", height: "16px", background: "white", border: "2px solid #3b82f6", borderRadius: "50%", right: "-8px", bottom: "-8px" },
        right: { width: "16px", height: "16px", background: "white", border: "2px solid #3b82f6", borderRadius: "50%", right: "-8px", top: "50%", transform: "translateY(-50%)" },
        bottom: { width: "16px", height: "16px", background: "white", border: "2px solid #3b82f6", borderRadius: "50%", bottom: "-8px", left: "50%", transform: "translateX(-50%)" },
        bottomLeft: { width: "16px", height: "16px", background: "white", border: "2px solid #3b82f6", borderRadius: "50%", left: "-8px", bottom: "-8px" },
        left: { width: "16px", height: "16px", background: "white", border: "2px solid #3b82f6", borderRadius: "50%", left: "-8px", top: "50%", transform: "translateY(-50%)" },
        topLeft: { width: "16px", height: "16px", background: "white", border: "2px solid #3b82f6", borderRadius: "50%", left: "-8px", top: "-8px" },
        top: { width: "16px", height: "16px", background: "white", border: "2px solid #3b82f6", borderRadius: "50%", top: "-8px", left: "50%", transform: "translateX(-50%)" },
        topRight: { width: "16px", height: "16px", background: "white", border: "2px solid #3b82f6", borderRadius: "50%", right: "-8px", top: "-8px" }
      }}
    >
      <div onDoubleClick={handleDoubleClick} className="w-full h-full flex flex-col justify-center pointer-events-auto">
        {isEditing ? (
          <textarea
            autoFocus
            className="w-full bg-transparent border-none outline-none resize-none overflow-hidden pointer-events-auto"
            rows={el.text ? el.text.split('\n').length || 1 : 1}
            style={{
              fontSize: el.type === 'signature' ? `${Math.max(16, (el.fontSize || 120) * 0.4)}px` : 'inherit',
              fontFamily: 'inherit', color: 'inherit', textAlign: 'inherit',
              fontWeight: 'inherit', fontStyle: 'inherit', lineHeight: 'inherit'
            }}
            value={el.text || ''}
            onChange={(e) => updateSelectedElement({ text: e.target.value })}
            onBlur={() => {
              setIsEditing(false);
              if (el.type === 'signature' && !el.src) {
                setTimeout(() => {
                  const node = document.getElementById(`rnd-${el.id}`);
                  if (node) {
                    updateSelectedElement({ width: node.offsetWidth, height: node.offsetHeight });
                  }
                }, 50);
              }
            }}
            onKeyDown={(e) => { if (e.key === 'Escape') setIsEditing(false) }}
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : el.type === 'qrCode' ? (
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
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <img src={el.src} alt="" className="w-full h-full object-contain" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1)) drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }} />
                <div className="animate-badge-shine" style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 60%, transparent 80%)",
                  backgroundSize: "200% 100%",
                  WebkitMaskImage: `url(${el.src})`,
                  WebkitMaskSize: "contain",
                  WebkitMaskPosition: "center",
                  WebkitMaskRepeat: "no-repeat",
                  pointerEvents: "none"
                }} />
              </div>
            ) : el.type === 'badge' ? (
              <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="goldOuterBadge" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#854d0e" />
                  </linearGradient>
                  <linearGradient id="goldInnerBadge" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#a16207" />
                  </linearGradient>

                  {/* Animated Shine Effect */}
                  <linearGradient id="badgeShine" x1="-100%" y1="-100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    <animate attributeName="x1" values="-100%; 200%" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="x2" values="0%; 300%" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="y1" values="-100%; 200%" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="y2" values="0%; 300%" dur="3s" repeatCount="indefinite" />
                  </linearGradient>
                </defs>

                {/* Sharp Rosette Base */}
                <path d="M 60.0 10.0 L 65.7 16.4 L 72.9 11.7 L 76.8 19.3 L 85.0 16.7 L 86.8 25.1 L 95.4 24.6 L 94.9 33.2 L 103.3 35.0 L 100.7 43.2 L 108.3 47.1 L 103.6 54.3 L 110.0 60.0 L 103.6 65.7 L 108.3 72.9 L 100.7 76.8 L 103.3 85.0 L 94.9 86.8 L 95.4 95.4 L 86.8 94.9 L 85.0 103.3 L 76.8 100.7 L 72.9 108.3 L 65.7 103.6 L 60.0 110.0 L 54.3 103.6 L 47.1 108.3 L 43.2 100.7 L 35.0 103.3 L 33.2 94.9 L 24.6 95.4 L 25.1 86.8 L 16.7 85.0 L 19.3 76.8 L 11.7 72.9 L 16.4 65.7 L 10.0 60.0 L 16.4 54.3 L 11.7 47.1 L 19.3 43.2 L 16.7 35.0 L 25.1 33.2 L 24.6 24.6 L 33.2 25.1 L 35.0 16.7 L 43.2 19.3 L 47.1 11.7 L 54.3 16.4 Z" fill="url(#goldOuterBadge)" />

                {/* Animated Shine overlaying the rosette base */}
                <path d="M 60.0 10.0 L 65.7 16.4 L 72.9 11.7 L 76.8 19.3 L 85.0 16.7 L 86.8 25.1 L 95.4 24.6 L 94.9 33.2 L 103.3 35.0 L 100.7 43.2 L 108.3 47.1 L 103.6 54.3 L 110.0 60.0 L 103.6 65.7 L 108.3 72.9 L 100.7 76.8 L 103.3 85.0 L 94.9 86.8 L 95.4 95.4 L 86.8 94.9 L 85.0 103.3 L 76.8 100.7 L 72.9 108.3 L 65.7 103.6 L 60.0 110.0 L 54.3 103.6 L 47.1 108.3 L 43.2 100.7 L 35.0 103.3 L 33.2 94.9 L 24.6 95.4 L 25.1 86.8 L 16.7 85.0 L 19.3 76.8 L 11.7 72.9 L 16.4 65.7 L 10.0 60.0 L 16.4 54.3 L 11.7 47.1 L 19.3 43.2 L 16.7 35.0 L 25.1 33.2 L 24.6 24.6 L 33.2 25.1 L 35.0 16.7 L 43.2 19.3 L 47.1 11.7 L 54.3 16.4 Z" fill="url(#badgeShine)" />

                {/* Inner Bevel / Ring */}
                <circle cx="60" cy="60" r="41" fill="url(#goldInnerBadge)" />
                <circle cx="60" cy="60" r="36" fill="none" stroke="#fef3c7" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
                <circle cx="60" cy="60" r="32" fill="none" stroke="#fef3c7" strokeWidth="0.75" opacity="0.5" />

                {/* SHIM Text */}
                <text x="60" y="58" fontFamily="Inter, system-ui, sans-serif" fontSize="20" fontWeight="900" letterSpacing="-0.5px" fill="rgba(255,255,255,0.9)" textAnchor="middle" style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.15))" }}>shim</text>

                {/* CERTIFIED Text */}
                <text x="60" y="68" fontFamily="var(--font-sans, Arial, sans-serif)" fontSize="6.5" fontWeight="900" fill="rgba(254,243,199,0.9)" textAnchor="middle" style={{ letterSpacing: "2px", filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.15))" }}>CERTIFIED</text>
              </svg>
            ) : el.type === 'qrCode' || el.type === 'qrcode' as any ? (
              <QRCodeSVG
                value={el.text || el.src || "https://shim.org/verify/sample"}
                size={1000}
                style={{ width: "100%", height: "100%" }}
                bgColor="transparent"
                fgColor={el.color || "#000000"}
              />
            ) : (
              <div className="w-full h-full bg-zinc-50 flex items-center justify-center border-2 border-dashed border-zinc-300 text-zinc-400 rounded-xl">
                <ImageIcon size={120} />
              </div>
            )}
          </div>
        ) : el.type === 'signature' ? (
          <div className="w-full h-full pointer-events-none flex flex-col items-center justify-end relative">
            {el.src ? (
              <img src={el.src} alt="Signature" style={{ maxWidth: "100%", maxHeight: "70%", objectFit: "contain", marginBottom: `${el.linePadding ?? 10}px` }} />
            ) : (
              <div style={{ whiteSpace: "nowrap", fontFamily: el.fontFamily || "var(--font-script, cursive)", fontSize: `${(el.fontSize || 120) * 1.5}px`, color: el.color || "#000000", paddingTop: "0.3em", paddingBottom: "0.1em", fontStyle: "italic", lineHeight: "normal" }}>
                {el.signatoryName ?? (el.text?.split('|')[0] || "Signature")}
              </div>
            )}
            {!el.hideLine && (
              <div style={{ width: "100%", borderTop: `${el.lineThickness ?? 4}px solid ${el.lineColor || el.color || "#000000"}`, flexShrink: 0, marginBottom: `${el.linePadding ?? 10}px`, marginTop: `${el.linePadding ?? 10}px` }} />
            )}
            <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: `${(el.fontSize || 60) * (el.titleFontSize ?? 0.4)}px`, fontFamily: el.titleFontFamily || "var(--font-sans, sans-serif)", color: el.titleColor || el.color || "#000000", fontWeight: "bold", textTransform: "uppercase", letterSpacing: `${el.titleLetterSpacing ?? 4}px` }}>
              {el.signatoryTitle ?? (el.text?.split('|')[1] || "Title")}
            </div>
          </div>
        ) : el.type === 'shape' ? null : (
          <span className="pointer-events-none block w-full">{displayText}</span>
        )}
      </div>
    </Rnd>
  );
}

