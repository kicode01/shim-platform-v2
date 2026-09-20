import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify ownership
    const existing = await prisma.event.findUnique({
      where: { id }
    });

    if (!existing || existing.organizerId !== (session.user as any).id) {
      return NextResponse.json({ message: "Event not found or unauthorized" }, { status: 404 });
    }

    const body = await req.json();
    const { name, date, description, defaultTemplateId, defaultRole } = body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        name: name?.trim() || existing.name,
        date: date ? new Date(date) : existing.date,
        description: description?.trim() !== undefined ? description.trim() : existing.description,
        defaultTemplateId: defaultTemplateId !== undefined ? defaultTemplateId : existing.defaultTemplateId,
        defaultRole: defaultRole?.trim() || existing.defaultRole,
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ message: "Error updating event" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.event.findUnique({
      where: { id }
    });

    if (!existing || existing.organizerId !== (session.user as any).id) {
      return NextResponse.json({ message: "Event not found or unauthorized" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ message: "Error deleting event" }, { status: 500 });
  }
}
