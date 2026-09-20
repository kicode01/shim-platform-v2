import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const { id: eventId } = await params;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Record attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        eventId_email: {
          eventId,
          email,
        },
      },
      update: {
        name,
        checkedInAt: new Date(),
      },
      create: {
        eventId,
        name,
        email,
        role: event.defaultRole,
      },
    });

    // Check if automated issuance is configured
    if (event.defaultTemplateId) {
      // Look for existing certificate for this event/email to avoid duplicates
      let certificate = await prisma.certificate.findFirst({
        where: {
          eventId,
          recipientEmail: email,
        },
      });

      // Issue certificate instantly if none exists
      if (!certificate) {
        certificate = await prisma.certificate.create({
          data: {
            recipientName: name,
            recipientEmail: email,
            role: attendance.role,
            status: "valid",
            eventId: event.id,
            templateId: event.defaultTemplateId,
            issuerId: event.organizerId, // The event organizer is the issuer
          },
        });

        await prisma.auditLog.create({
          data: {
            action: "ISSUED",
            certificateId: certificate.id,
            ipAddress: req.headers.get("x-forwarded-for") || "Kiosk",
            details: JSON.stringify({ method: "kiosk_checkin" })
          }
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Checked in and certificate issued.",
        certificateId: certificate.id
      });
    }

    // Deferred issuance
    return NextResponse.json({ 
      success: true, 
      message: "Checked in successfully. Certificate will be issued later." 
    });

  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check in" },
      { status: 500 }
    );
  }
}
