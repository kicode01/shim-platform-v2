"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { 
  Award, 
  ShieldCheck, 
  ShieldAlert, 
  FileSpreadsheet, 
  Plus, 
  Stamp,
  Calendar,
  ArrowRight,
  Activity
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
}: {
  initialEvents: EventItem[];
  initialStats: StatsData;
}) {

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-8 py-6 min-h-0 overflow-hidden">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800 mb-1">Overview</h1>
          <p className="text-zinc-500 text-sm font-medium">Manage your event credentials and templates</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard/templates" className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-800 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
            <Stamp size={16} />
            <span className="hidden sm:inline">Templates</span>
          </Link>
          <Link href="/dashboard/generate" className="flex items-center gap-2 bg-zinc-800 text-white hover:bg-zinc-800 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
            <Plus size={16} />
            <span>Issue Credential</span>
          </Link>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 shrink-0">
        {[
          { 
            label: "Total Issued", 
            value: initialStats.totalCertificates, 
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="9" height="9" />
                <rect x="13" y="13" width="9" height="9" />
                <rect x="2" y="13" width="9" height="9" fillOpacity="0.3" />
                <rect x="13" y="2" width="9" height="9" fillOpacity="0.3" />
              </svg>
            )
          },
          { 
            label: "Valid Standing", 
            value: initialStats.validCertificates, 
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="10,18 4,12 7,9 10,12 18,4 21,7" />
              </svg>
            )
          },
          { 
            label: "Revoked", 
            value: initialStats.revokedCertificates, 
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="21,5 19,3 12,10 5,3 3,5 10,12 3,19 5,21 12,14 19,21 21,19 14,12" />
              </svg>
            )
          },
          { 
            label: "Validation Rate", 
            value: `${initialStats.validationRate}%`, 
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="14" width="5" height="8" />
                <rect x="9" y="8" width="5" height="14" />
                <rect x="16" y="2" width="5" height="20" />
              </svg>
            )
          },
          { 
            label: "Total Verifications", 
            value: initialStats.totalVerifications, 
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )
          },
          { 
            label: "Total Claimed", 
            value: initialStats.totalClaimed, 
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 16l-5-5 1.41-1.41L12 16.17l7.59-7.59L21 10l-9 9z"/>
              </svg>
            )
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] relative group overflow-hidden">
            {/* Background decorative element on hover */}
            <div className="absolute -right-8 -top-8 text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-[3]">
              {stat.icon}
            </div>
            
            <div className="flex justify-between items-start w-full relative z-10">
              <div className="text-sm font-medium text-zinc-500 leading-tight max-w-[70%]">
                {stat.label}
              </div>
              <div className="text-zinc-400">
                {stat.icon}
              </div>
            </div>
            
            <div className="text-4xl font-bold text-zinc-800 mt-6 relative z-10">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Events & Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Col: Recent Events */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-0">
          
          <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-white shrink-0">
            <h2 className="text-xl font-bold text-zinc-800">Recent Events</h2>
            <Link href="/dashboard/events" className="text-sm font-medium text-zinc-600 hover:text-zinc-800 flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">
            {initialEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-6">
                  <Calendar size={24} className="text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-800 mb-2">No events found</h3>
                <p className="text-zinc-500 font-medium max-w-sm">
                  You haven't created any events yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {initialEvents.map((event) => (
                  <Link 
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors group"
                  >
                    <div>
                      <h4 className="font-medium text-zinc-800 mb-1 group-hover:text-black transition-colors">{event.name}</h4>
                      <p className="text-sm text-zinc-500">
                        {event.date ? new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "No date set"}
                      </p>
                    </div>
                    <div className="flex gap-6 text-sm text-zinc-600">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-zinc-800">{event.attendeeCount}</span>
                        <span className="text-xs text-zinc-500">Attendees</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-zinc-800">{event.credentialCount}</span>
                        <span className="text-xs text-zinc-500">Credentials</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Analytics Chart */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col h-full min-h-0">
          <div className="p-6 border-b border-zinc-200 shrink-0">
            <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                <polyline points="2 20 8 10 14 14 22 4" />
              </svg>
              Issuance Analytics
            </h3>
            <p className="text-sm font-medium text-zinc-500 mt-1">Monthly generation volume</p>
          </div>
          
          <div className="p-6 flex-1 w-full flex flex-col min-h-[150px]">
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

          <div className="p-6 bg-zinc-50 border-t border-zinc-200 rounded-b-xl mt-auto text-center shrink-0">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-800 mb-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="10" width="16" height="12" rx="2" />
                <path d="M7 10V6a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              System Secure
            </div>
            <div className="text-sm text-zinc-500">
              Ledger synced cryptographically
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
