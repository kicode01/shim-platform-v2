import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PortalClient from "./PortalClient";

export default async function PortalPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user || user.role !== "member") {
    redirect("/dashboard");
  }

  // Fetch all certificates assigned to this member's email
  const certificates = await prisma.certificate.findMany({
    where: {
      recipientEmail: user.email,
    },
    include: {
      event: true,
      template: true,
    },
    orderBy: {
      issueDate: 'desc'
    }
  });

  // Serialize dates for client
  const serializedCertificates = certificates.map(cert => ({
    id: cert.id,
    recipientName: cert.recipientName,
    role: cert.role,
    status: cert.status,
    issueDate: cert.issueDate.toISOString(),
    event: { name: cert.event.name },
    template: { name: cert.template?.name || "Standard Template" }
  }));

  // Calculate stats
  const attendances = await prisma.attendance.findMany({
    where: { email: user.email! }
  });

  const attendedEventIds = [...new Set([
    ...certificates.map(c => c.eventId),
    ...attendances.map(a => a.eventId)
  ])];

  const attendedEvents = await prisma.event.findMany({
    where: { id: { in: attendedEventIds } },
    select: { name: true, organizer: { select: { name: true } } }
  });

  const eventNames = Array.from(new Set(attendedEvents.map(e => e.name)));
  const orgNames = Array.from(new Set(attendedEvents.map(e => e.organizer?.name).filter((name): name is string => !!name)));

  const totalVerifications = await prisma.auditLog.count({
    where: {
      action: "VERIFIED",
      certificateId: { in: certificates.map(c => c.id) }
    }
  });

  const stats = {
    totalCertificates: certificates.length,
    eventsAttended: eventNames.length,
    organizations: orgNames.length,
    verifications: totalVerifications
  };

  const insights = {
    events: eventNames,
    organizations: orgNames,
  };

  return (
    <PortalClient 
      user={{ name: user.name || "Member", membershipId: user.membershipId || "MEMBER" }} 
      certificates={serializedCertificates} 
      stats={stats}
      insights={insights}
    />
  );
}
