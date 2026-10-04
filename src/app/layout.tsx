import type { Metadata } from "next";
import { Inter, Outfit, Cinzel, Cormorant_Garamond, Great_Vibes, Playfair_Display, Space_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import SurfaceMarker from "@/components/SurfaceMarker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-spacemono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-spacegrotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "shim | credential platform",
    template: "shim | %s",
  },
  description: "Digital Certificate Generation and Authentication System with QR-Based Verification for events, seminars, and webinars.",
  keywords: ["Digital Certificates", "QR Verification", "Event Management", "Certificate Generator", "Seminar Certificates"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${cinzel.variable} ${cormorant.variable} ${greatVibes.variable} ${playfair.variable} ${spaceMono.variable} ${spaceGrotesk.variable}`}>
      <body className="flex flex-col h-screen w-full overflow-hidden bg-[#0a0a0a]">
        <AuthProvider>
          <Navbar />
          {/* <main> is the app-wide scroll container, so it owns BOTH the page
              surface and the reserved `scrollbar-gutter`. Two consequences:
              1. `bg-zinc-50` lives here, not on the pages. A light page that
                 painted its own surface inside the gutter left an ~8px strip
                 where <body>'s near-black showed through as a black stripe
                 down the right edge.
              2. <SurfaceMarker /> sets `data-surface` from the route, which
                 drives the scrollbar colours in globals.css, so the dark pages
                 (/validate, /login, /) get a dark rail and light pages a zinc
                 one — without either page reaching outside itself. */}
          <main data-app-scroll data-surface="light" className="flex-1 flex flex-col relative min-h-0 overflow-y-auto bg-zinc-50 [scrollbar-gutter:stable]">
            <SurfaceMarker />
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
