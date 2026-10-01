"use client";
import { useState } from "react";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { 
  Award, 
  ShieldCheck, 
  ShieldAlert, 
  FileSpreadsheet, 
  Plus, 
  Stamp,
  Calendar,
  ArrowRight,
  Activity,
  Files,
  BadgeCheck,
  XOctagon,
  TrendingUp,
  TrendingDown,
  ChevronDown
} from "lucide-react";

interface EventItem {
  id: string;
  name: string;
  date: string | null;
  attendeeCount: number;
  credentialCount: number;
}

interface StatsData {
  totalCertificates: number;
  validCertificates: number;
  revokedCertificates: number;
  totalTemplates: number;
  validationRate: number;
  totalVerifications: number;
  totalClaimed: number;
  chartData?: any[];
}

export default function DashboardClient({
  initialEvents,
  initialStats,
  allCertificates = [],
  allVerifications = [],
}: {
  initialEvents: EventItem[];
  initialStats: StatsData;
  allCertificates?: { issueDate: string | Date; status: string; isClaimed: boolean }[];
  allVerifications?: { timestamp: string | Date }[];
}) {
  const [timeframe, setTimeframe] = useState("30d");

  // Helper to get date boundaries for a timeframe
  const getTimeframeDates = (tf: string) => {
    const now = new Date();
    const startDate = new Date();
    const prevStartDate = new Date();
    
    if (tf === "7d") {
      startDate.setDate(now.getDate() - 7);
      prevStartDate.setDate(now.getDate() - 14);
    } else if (tf === "30d") {
      startDate.setDate(now.getDate() - 30);
      prevStartDate.setDate(now.getDate() - 60);
    } else if (tf === "12m") {
      startDate.setFullYear(now.getFullYear() - 1);
      prevStartDate.setFullYear(now.getFullYear() - 2);
    } else {
      return { start: new Date(0), prevStart: new Date(0) }; // All time
    }
    return { start: startDate, prevStart: prevStartDate };
  };

  // Helper to calculate percentage change
  const calcTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const pct = ((current - previous) / previous) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  const { start, prevStart } = getTimeframeDates(timeframe);

  // Aggregate current period
  const currentCerts = allCertificates.filter(c => new Date(c.issueDate) >= start);
  const currentVerifs = allVerifications.filter(v => new Date(v.timestamp) >= start);
  
  const currentValid = currentCerts.filter(c => c.status === "valid").length;
  const currentRevoked = currentCerts.filter(c => c.status === "revoked").length;
  const currentClaimed = currentCerts.filter(c => c.isClaimed).length;
  const currentValidationRate = currentCerts.length > 0 ? Math.round((currentValid / currentCerts.length) * 100) : 100;

  // Aggregate previous period for trends
  const prevCerts = allCertificates.filter(c => {
    const d = new Date(c.issueDate);
    return d >= prevStart && d < start;
  });
  const prevVerifs = allVerifications.filter(v => {
    const d = new Date(v.timestamp);
    return d >= prevStart && d < start;
  });

  const prevValid = prevCerts.filter(c => c.status === "valid").length;
  const prevRevoked = prevCerts.filter(c => c.status === "revoked").length;
  const prevClaimed = prevCerts.filter(c => c.isClaimed).length;
  const prevValidationRate = prevCerts.length > 0 ? Math.round((prevValid / prevCerts.length) * 100) : 100;

  // Build final stats object
  const currentStats = timeframe === "all" ? initialStats : {
    ...initialStats,
    totalCertificates: currentCerts.length,
    validCertificates: currentValid,
    revokedCertificates: currentRevoked,
    totalClaimed: currentClaimed,
    totalVerifications: currentVerifs.length,
    validationRate: currentValidationRate,
  };

  const trends = {
    total: calcTrend(currentCerts.length, prevCerts.length),
    valid: calcTrend(currentValid, prevValid),
    revoked: (currentRevoked - prevRevoked).toString(), // Absolute delta for revoked
    claimed: calcTrend(currentClaimed, prevClaimed),
    verifs: calcTrend(currentVerifs.length, prevVerifs.length),
    rate: calcTrend(currentValidationRate, prevValidationRate),
  };

  const getTrendLabel = () => {
    switch (timeframe) {
      case "7d": return "vs last week";
      case "30d": return "vs last month";
      case "12m": return "vs last year";
      default: return "all time";
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-8 py-6 min-h-0 overflow-y-auto">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-zinc-700 mb-1">Overview</h1>
          <p className="text-zinc-500 text-sm font-medium">Manage your event credentials and templates</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Select
              value={timeframe}
              onChange={setTimeframe}
              options={[
                { value: "30d", label: "Last 30 days" },
                { value: "7d", label: "Last 7 days" },
                { value: "12m", label: "Last 12 months" },
                { value: "all", label: "All time" }
              ]}
              className="w-[140px]"
              dropdownClassName="min-w-[140px]"
            />
          </div>
          
          <div className="w-px h-6 bg-zinc-200 mx-1"></div>

          <Link href="/dashboard/templates" className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-700 px-3 py-2 rounded-md font-medium text-sm transition-colors shadow-sm h-9">
            <Stamp size={16} />
            <span className="hidden sm:inline">Templates</span>
          </Link>
          <Link href="/dashboard/generate" className="flex items-center gap-2 bg-zinc-700 text-white hover:bg-zinc-700 px-3 py-2 rounded-md font-medium text-sm transition-colors shadow-sm h-9">
            <Plus size={16} />
            <span>Issue Credential</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Ribbon */}
      <div className="bg-zinc-200 border border-zinc-200 rounded-xl shadow-sm mb-6 shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[1px] overflow-hidden">
        {[
          { label: "Total Issued", value: currentStats.totalCertificates, Icon: Files, iconColor: "text-zinc-900", trend: trends.total, trendLabel: getTrendLabel(), isPositive: !trends.total.startsWith("-") },
          { label: "Valid & Active", value: currentStats.validCertificates, Icon: ShieldCheck, iconColor: "text-emerald-500", trend: trends.valid, trendLabel: getTrendLabel(), isPositive: !trends.valid.startsWith("-") },
          { label: "Verifications", value: currentStats.totalVerifications, Icon: BadgeCheck, iconColor: "text-blue-500", trend: trends.verifs, trendLabel: getTrendLabel(), isPositive: !trends.verifs.startsWith("-") },
          { label: "Revoked", value: currentStats.revokedCertificates, Icon: XOctagon, iconColor: "text-red-500", trend: trends.revoked.startsWith("-") ? trends.revoked : `+${trends.revoked}`, trendLabel: getTrendLabel(), isPositive: trends.revoked.startsWith("-") || trends.revoked === "0" },
          { label: "Total Claimed", value: currentStats.totalClaimed, Icon: Award, iconColor: "text-purple-500", trend: trends.claimed, trendLabel: getTrendLabel(), isPositive: !trends.claimed.startsWith("-") },
          { label: "Validation Rate", value: `${currentStats.validationRate}%`, Icon: Activity, iconColor: "text-orange-500", trend: trends.rate, trendLabel: getTrendLabel(), isPositive: !trends.rate.startsWith("-") },
        ].map((stat, idx) => {
          const Icon = stat.Icon;
          return (
          <div key={idx} className="relative p-5 bg-white flex flex-col justify-center hover:bg-zinc-50/80 transition-colors overflow-hidden group">
            {/* Background Watermark Icon */}
            <div className={`absolute -right-2 -bottom-3 opacity-[0.06] group-hover:opacity-[0.09] transition-opacity ${stat.iconColor} pointer-events-none`}>
              <Icon size={76} strokeWidth={2} />
            </div>

            <div className="flex items-center mb-1.5 relative z-10">
              <div className="text-sm font-medium text-zinc-500">{stat.label}</div>
            </div>
            <div className="text-3xl font-bold text-zinc-800 tracking-tight relative z-10">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            {stat.trend !== "0%" && stat.trend !== "+0%" && stat.trend !== "0.0%" && stat.trend !== "+0.0%" && stat.trend !== "0" && stat.trend !== "+0" && (
              <div className="flex items-center gap-1 text-xs mt-1.5 relative z-10">
                <span className={`inline-flex items-center gap-0.5 font-medium ${stat.isPositive ? 'text-emerald-600' : 'text-zinc-500'}`}>
                  {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.trend}
                </span>
              </div>
            )}
          </div>
        )})}
      </div>

      {/* Main Grid: Recent Events & Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[400px] shrink-0">
        
        {/* Left Col: Analytics Chart (Takes 2 columns for wider timeline) */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-white shrink-0">
            <div>
              <h3 className="text-lg font-bold text-zinc-700">
                Issuance Analytics
              </h3>
              <p className="text-sm font-medium text-zinc-500 mt-1">Monthly generation volume</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="10" width="16" height="12" rx="2" />
                <path d="M7 10V6a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Ledger Synced
            </div>
          </div>
          
          <div className="p-6 flex-1 w-full flex flex-col min-h-[250px]">
            {initialStats.chartData && initialStats.chartData.length > 0 ? (
              <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%" className="absolute inset-0">
                  <AreaChart data={initialStats.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <pattern id="minimalistPattern" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke="#a1a1aa" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="name" axisLine={{stroke: '#e4e4e7', strokeWidth: 1}} tickLine={false} tick={{ fontSize: 12, fill: "#71717a" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#71717a" }} />
                    <Tooltip 
                      contentStyle={{ 
                        fontSize: "13px", 
                        borderRadius: "8px", 
                        border: "1px solid #e4e4e7",
                        fontWeight: "500",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        color: "#18181b"
                      }} 
                    />
                    <Area type="monotone" dataKey="issued" stroke="#18181b" strokeWidth={2} fillOpacity={0.2} fill="url(#minimalistPattern)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 min-h-[150px]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-zinc-300">
                  <polyline points="2 20 8 10 14 14 22 4" />
                </svg>
                <span className="text-sm font-medium text-zinc-400">Not enough data</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recent Events (Takes 1 column for a compact list view) */}
        <div className="xl:col-span-1 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-0">
          <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-white shrink-0">
            <h2 className="text-lg font-bold text-zinc-700">Recent Events</h2>
            <Link href="/dashboard/events" className="text-sm font-medium text-zinc-600 hover:text-zinc-700 flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto bg-zinc-50/50">
            {initialEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-12 h-12 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Calendar size={20} className="text-zinc-400" />
                </div>
                <h3 className="text-base font-bold text-zinc-700 mb-1">No events found</h3>
                <p className="text-xs text-zinc-500 font-medium">
                  You haven't created any events yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {initialEvents.map((event) => (
                  <Link 
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="flex flex-col p-4 bg-white hover:bg-zinc-50 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-zinc-700 text-sm group-hover:text-black transition-colors leading-tight line-clamp-1">{event.name}</h4>
                      <div className="text-[10px] font-medium text-zinc-400 whitespace-nowrap ml-2">
                        {event.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA"}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded-md text-zinc-600">
                        <span className="font-semibold">{event.attendeeCount}</span>
                        <span className="text-zinc-500">Attendees</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md text-blue-700">
                        <span className="font-semibold">{event.credentialCount}</span>
                        <span className="opacity-75">Credentials</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
