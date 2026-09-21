import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import DashboardClient from "./DashboardClient";
import Link from "next/link";
import { Plus, Stamp } from "lucide-react";

export const metadata: Metadata = {
  title: "Overview",
  description: "Organizer dashboard for managing events, templates, and digital certificates.",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role === "member") {
    redirect("/portal");
  }

  // Load server-side initial stats and events
  const userId = session.user.id;
  const [
    totalCertificates, 
    validCertificates, 
    revokedCertificates, 
    totalTemplates, 
    totalVerifications,
    totalClaimed,
    recentEvents,
    allCertificates
  ] = await Promise.all([
    prisma.certificate.count({ where: { issuerId: userId } }),
    prisma.certificate.count({ where: { issuerId: userId, status: "valid" } }),
    prisma.certificate.count({ where: { issuerId: userId, status: "revoked" } }),
    prisma.template.count({ where: { userId } }),
    prisma.auditLog.count({ where: { action: "VERIFIED", certificate: { issuerId: userId } } }),
    prisma.certificate.count({ where: { issuerId: userId, isClaimed: true } }),
    prisma.event.findMany({
      where: { organizerId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { attendances: true, certificates: true }
        }
      }
    }),
    prisma.certificate.findMany({
      where: { issuerId: userId },
      select: { issueDate: true, status: true }
    })
  ]);

  // Aggregate monthly data for the last 6 months
  const monthlyData: Record<string, { name: string, issued: number, revoked: number }> = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Initialize last 6 months
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    monthlyData[key] = { name: key, issued: 0, revoked: 0 };
  }

  // Populate data
  allCertificates.forEach(cert => {
    const d = new Date(cert.issueDate);
    const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    if (monthlyData[key]) {
      if (cert.status === "valid") monthlyData[key].issued++;
      else if (cert.status === "revoked") monthlyData[key].revoked++;
    }
  });

  const chartData = Object.values(monthlyData);

  const initialStats = {
    totalCertificates,
    validCertificates,
    revokedCertificates,
    totalTemplates,
    totalVerifications,
    totalClaimed,
    chartData,
    validationRate: totalCertificates > 0 ? Math.round((validCertificates / totalCertificates) * 100) : 100
  };

  const serializedEvents = recentEvents.map(e => ({
    id: e.id,
    name: e.name,
    date: e.date ? e.date.toISOString() : null,
    attendeeCount: e._count.attendances,
    credentialCount: e._count.certificates
  }));

  return (
    <div className="dashboard-bg" style={{ height: "100vh", overflow: "auto", display: "flex", flexDirection: "column" }}>
      <main className="page-container-wide animate-fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, paddingBottom: "2rem", paddingTop: "2rem" }}>
        <DashboardClient 
          initialEvents={serializedEvents} 
          initialStats={initialStats} 
        />
      </main>
    </div>
  );
}
