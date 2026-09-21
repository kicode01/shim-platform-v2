"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Stamp, 
  FileSpreadsheet, 
  Calendar,
  BookOpen,
  History
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/credentials", label: "Credentials", icon: BookOpen },
    { href: "/dashboard/events", label: "Events", icon: Calendar },
    { href: "/dashboard/templates", label: "Templates", icon: Stamp },
    { href: "/dashboard/generate", label: "Generate", icon: FileSpreadsheet },
    { href: "/dashboard/audit", label: "Audit Trail", icon: History },
  ];

  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-zinc-200 bg-white/50 backdrop-blur-md hidden md:flex flex-col h-full sticky top-16 overflow-y-auto z-40">
      <div className="p-4 py-8 flex-1">
        <nav className="space-y-1 flex flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && item.href !== "/validate");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors z-10 group ${
                  isActive 
                    ? "text-zinc-800" 
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-pill" 
                    className="absolute inset-0 bg-zinc-100 rounded-lg"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <Icon size={18} className={isActive ? "text-zinc-800" : "text-zinc-400 group-hover:text-zinc-600 transition-colors"} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
