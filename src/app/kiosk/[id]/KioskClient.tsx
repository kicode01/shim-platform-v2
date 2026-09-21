"use client";

import { useEffect, useState, useRef } from "react";
import { Maximize, X } from "lucide-react";
import Link from "next/link";

interface KioskClientProps {
  eventId: string;
  eventName: string;
  initialCount: number;
}

export default function KioskClient({ eventId, eventName, initialCount }: KioskClientProps) {
  const [attendanceCount, setAttendanceCount] = useState(initialCount);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate styled QR code specifically for shim
    const generateQR = async () => {
      try {
        const url = `${window.location.origin}/attend/${eventId}`;
        
        // Dynamically import to avoid Next.js SSR issues with window/document
        const QRCodeStyling = (await import("qr-code-styling")).default;
        
        const qrCode = new QRCodeStyling({
          width: 400,
          height: 400,
          type: "svg",
          data: url,
          image: `${window.location.origin}/icon.svg`,
          dotsOptions: {
            color: "#ffffff",
            type: "classy", 
          },
          cornersSquareOptions: {
            color: "#ffffff",
            type: "square",
          },
          cornersDotOptions: {
            color: "#ffffff",
            type: "square",
          },
          backgroundOptions: {
            color: "transparent",
          },
          imageOptions: {
            margin: 15,
            imageSize: 0.25
          }
        });
        
        if (qrRef.current) {
          qrRef.current.innerHTML = "";
          qrCode.append(qrRef.current);
        }
      } catch (err) {
        console.error("Failed to generate styled QR code", err);
      }
    };
    
    generateQR();
  }, [eventId]);

  // Polling for live attendance count
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/attendance-count`);
        if (res.ok) {
          const data = await res.json();
          setAttendanceCount(data.count);
        }
      } catch (err) {
        console.error("Failed to poll attendance", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [eventId]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 flex flex-col relative font-sans selection:bg-zinc-200">
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full">
        <div className="flex flex-col items-center max-w-3xl w-full">
          
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-800 mb-4 leading-tight">
              {eventName}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 max-w-xl mx-auto font-medium">
              Scan this QR code with your phone's camera to instantly check in.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="relative mb-12">
            <div className="bg-zinc-950 p-8 md:p-10 rounded-[2.5rem] border border-zinc-800 relative">
              <div 
                ref={qrRef} 
                className="w-80 h-80 md:w-[400px] md:h-[400px] flex items-center justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-full relative"
              >
              </div>
              {/* Fallback overlay in case canvas fails to draw SVG */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950 w-16 h-16 flex items-center justify-center pointer-events-none z-50">
                <img src="/icon-white.svg" alt="Shim Logo" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
              </div>
            </div>
            
            {/* Pulsing prompt */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white text-zinc-950 px-8 py-3 rounded-full font-semibold flex items-center justify-center shadow-md border border-zinc-200 whitespace-nowrap">
              Ready to Scan
            </div>
          </div>



        </div>
      </main>

    </div>
  );
}
