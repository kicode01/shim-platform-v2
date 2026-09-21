"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Stamp, 
  FileSpreadsheet, 
  LogOut,
  UserCheck,
  Calendar,
  ArrowRight,
  BookOpen,
  History,
  Award,
  User
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingMode = pathname === "/" || isAuthPage;
  const isValidateMode = pathname.startsWith("/validate");
  const isDashboardMode = pathname.startsWith("/dashboard");
  const isPortalMode = pathname.startsWith("/portal");

  const [confirmLogout, setConfirmLogout] = useState(false);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    // Prefetch pages for fast transitions
    router.prefetch('/validate');
    router.prefetch('/dashboard');
    router.prefetch('/portal');
  }, [router]);

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/credentials", label: "Credentials", icon: BookOpen },
    { href: "/dashboard/events", label: "Events", icon: Calendar },
    { href: "/dashboard/templates", label: "Templates", icon: Stamp },
    { href: "/dashboard/generate", label: "Generate", icon: FileSpreadsheet },
    { href: "/dashboard/audit", label: "Audit Trail", icon: History },
  ];

  if (pathname.startsWith("/kiosk") || pathname.startsWith("/scanner")) return null;

  return (
    <>
      <header className={`sticky top-0 z-50 no-print px-4 sm:px-6 transition-colors duration-500 flex items-center h-16 ${
        isLandingMode
          ? 'bg-[#0a0a0a] border-b border-zinc-800' 
          : 'bg-white border-b border-zinc-200'
      }`}>
        <div className="max-w-7xl mx-auto w-full h-full flex justify-between items-center">
          
          {/* Left area begins - Logo */}
          <div className="w-[200px] shrink-0 h-full flex items-center">
            <Link 
              href={isLandingMode ? "/" : isPortalMode ? "/portal" : "/dashboard"} 
              className={`flex items-center h-full z-50 ${
                (pathname === "/dashboard" || pathname === "/" || pathname === "/portal" || isValidateMode) ? 'cursor-default pointer-events-none' : ''
              }`}
            >
              <div className="flex items-baseline relative">
                <motion.span 
                  layout="position"
                  animate={{ 
                    fontSize: isLandingMode ? "36px" : "24px",
                    color: isLandingMode ? "#ffffff" : "#18181b"
                  }}
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="font-black tracking-[-0.08em] lowercase leading-none" 
                  style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
                >
                  shim
                </motion.span>
                
                <AnimatePresence mode="wait">
                  {isLandingMode && (
                    <motion.span 
                      key="subtitle"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-[0.6rem] font-bold text-zinc-400 uppercase tracking-widest absolute top-full left-0 whitespace-nowrap"
                    >
                      Digital Credential Platform
                    </motion.span>
                  )}
                  {isDashboardMode && (
                    <motion.span 
                      key="dashboard"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-zinc-800 text-2xl font-black tracking-[-0.08em] lowercase leading-none"
                      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
                    >
                      .organizer
                    </motion.span>
                  )}
                  {isPortalMode && (
                    <motion.span 
                      key="portal"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-zinc-800 text-2xl font-black tracking-[-0.08em] lowercase leading-none"
                      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
                    >
                      .attendee
                    </motion.span>
                  )}
                  {isValidateMode && (
                    <motion.span 
                      key="validate"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-zinc-400 text-2xl font-black tracking-[-0.08em] lowercase leading-none"
                      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
                    >
                      .validate
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          </div>

          {/* Middle Content - Nav Links */}
          <div className="flex-1 flex justify-center h-full">
            <AnimatePresence>
              {/* Other modes could place items here if needed in the future */}
            </AnimatePresence>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-end h-full w-[300px] shrink-0">
            {isMounted && (
              <AnimatePresence mode="wait">
                {isLandingMode && (
                  <motion.div 
                    key="landing-right"
                    initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="flex items-center gap-4 sm:gap-6"
                >
                  {!isAuthPage && (
                    <>
                      <Link href="/validate" className="text-sm font-medium text-zinc-100 hover:text-white transition-colors flex items-center gap-1.5 bg-zinc-800 border border-zinc-800 rounded-md px-3 py-1.5 hover:border-zinc-700 whitespace-nowrap shadow-sm">
                        Verify
                      </Link>
                      <div className="h-5 w-px bg-zinc-800 shrink-0 hidden sm:block"></div>
                      <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors whitespace-nowrap hidden sm:inline-block">
                        Sign In
                      </Link>
                      <Link href="/register" className="bg-zinc-100 hover:bg-white text-zinc-800 transition-colors text-sm font-medium rounded-md px-4 py-2 flex items-center gap-2 whitespace-nowrap shadow-sm">
                        Get Started
                        <ArrowRight size={14} className="shrink-0" />
                      </Link>
                    </>
                  )}
                </motion.div>
              )}

              {isDashboardMode && (
                <motion.div 
                  key="dashboard-right"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="flex items-center gap-4 h-full"
                >
                  {/* Verify button — organizer only */}
                  <Link
                    href="/validate"
                    className="flex items-center justify-center gap-1.5 border rounded-md px-3 py-1.5 transition-colors group shadow-sm bg-white border-zinc-200 hover:bg-zinc-50"
                  >
                    <span className="text-sm font-medium transition-colors whitespace-nowrap text-zinc-700 group-hover:text-zinc-800">
                      Verify
                    </span>
                  </Link>

                  <div className="w-px h-5 bg-zinc-200"></div>

                  {/* User chip */}
                  <div className="flex items-stretch border h-9 rounded-md shrink-0 shadow-sm overflow-hidden border-zinc-200 bg-white">
                    <div className="hidden md:flex px-3 py-1 flex-col justify-center border-r max-w-[10rem] xl:max-w-[14rem] border-zinc-200 bg-zinc-50">
                      <span className="text-xs font-medium leading-none truncate text-zinc-800">
                        {session?.user?.name || "User"}
                      </span>
                      <span className="text-[10px] leading-none truncate mt-0.5 text-zinc-500">
                        {session?.user?.email || "..."}
                      </span>
                    </div>
                    <div className="w-9 h-full flex items-center justify-center font-medium text-sm shrink-0 bg-zinc-100 text-zinc-700">
                      {session?.user?.name?.charAt(0).toUpperCase() || <UserCheck size={16} />}
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={async () => {
                      if (!confirmLogout) {
                        setConfirmLogout(true);
                        if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
                        logoutTimeoutRef.current = setTimeout(() => setConfirmLogout(false), 3000);
                      } else {
                        if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
                        setConfirmLogout(false);
                        await signOut({ redirect: false });
                        const isLocal = window.location.hostname.includes("localhost");
                        window.location.href = isLocal ? "/logout" : "https://shim-hq.vercel.app/logout";
                      }
                    }}
                    className={`shrink-0 flex items-center justify-center border transition-all rounded-md overflow-hidden ${
                      confirmLogout 
                        ? "w-[80px] h-9 border-red-600 bg-red-600 text-white hover:bg-red-700 shadow-sm" 
                        : "w-9 h-9 border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 shadow-sm"
                    }`}
                    title="Sign Out"
                  >
                    <AnimatePresence mode="wait">
                      {confirmLogout ? (
                        <motion.span 
                          key="confirm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="text-xs font-medium whitespace-nowrap"
                        >
                          Confirm
                        </motion.span>
                      ) : (
                        <motion.div 
                          key="icon"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          <LogOut size={16} strokeWidth={2} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              )}

              {/* Portal right section — white, no Verify */}
              {isPortalMode && (
                <motion.div
                  key="portal-right"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="flex items-center gap-4 h-full"
                >
                  {/* User chip — light */}
                  <div className="flex items-stretch border h-9 rounded-md shrink-0 shadow-sm overflow-hidden border-zinc-200 bg-white">
                    <div className="hidden md:flex px-3 py-1 flex-col justify-center border-r max-w-[10rem] xl:max-w-[14rem] border-zinc-200 bg-zinc-50">
                      <span className="text-xs font-medium leading-none truncate text-zinc-800">
                        {session?.user?.name || "Member"}
                      </span>
                      <span className="text-[10px] leading-none truncate mt-0.5 text-zinc-500">
                        {session?.user?.email || "..."}
                      </span>
                    </div>
                    <div className="w-9 h-full flex items-center justify-center font-medium text-sm shrink-0 bg-zinc-100 text-zinc-700">
                      {session?.user?.name?.charAt(0).toUpperCase() || <UserCheck size={16} />}
                    </div>
                  </div>

                  {/* Logout — light */}
                  <button
                    onClick={async () => {
                      if (!confirmLogout) {
                        setConfirmLogout(true);
                        if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
                        logoutTimeoutRef.current = setTimeout(() => setConfirmLogout(false), 3000);
                      } else {
                        if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
                        setConfirmLogout(false);
                        await signOut({ redirect: false });
                        const isLocal = window.location.hostname.includes("localhost");
                        window.location.href = isLocal ? "/logout" : "https://shim-hq.vercel.app/logout";
                      }
                    }}
                    className={`shrink-0 flex items-center justify-center border transition-all rounded-md overflow-hidden ${
                      confirmLogout
                        ? "w-[80px] h-9 border-red-600 bg-red-600 text-white hover:bg-red-700 shadow-sm"
                        : "w-9 h-9 border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 shadow-sm"
                    }`}
                    title="Sign Out"
                  >
                    <AnimatePresence mode="wait">
                      {confirmLogout ? (
                        <motion.span
                          key="confirm-portal"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="text-xs font-medium whitespace-nowrap"
                        >
                          Confirm
                        </motion.span>
                      ) : (
                        <motion.div
                          key="icon-portal"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          <LogOut size={16} strokeWidth={2} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              )}

              {isValidateMode && (
                <motion.div 
                  key="validate-right"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="flex items-center gap-4"
                >
                  {session?.user ? (
                    (session.user as any).role === "member" ? (
                      <Link 
                        href="/portal"
                        className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-800 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
                      >
                        <LayoutDashboard size={16} />
                        <span>Portal</span>
                      </Link>
                    ) : (
                      <Link 
                        href="/dashboard"
                        className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-800 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
                      >
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                      </Link>
                    )
                  ) : (
                    <div className="flex items-center gap-6">
                      <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors whitespace-nowrap">
                        Home
                      </Link>
                      <Link href="/login" className="flex items-center justify-center bg-zinc-800 border border-zinc-800 hover:bg-zinc-800 text-zinc-100 hover:text-white transition-colors rounded-md px-4 py-2 shadow-sm text-sm font-medium whitespace-nowrap">
                        Sign In
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
