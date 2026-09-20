const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1. Ensure admin user exists
  let admin = await prisma.user.findFirst({ where: { email: "admin@shim.app" } });
  if (!admin) {
    admin = await prisma.user.create({ data: { email: "admin@shim.app", name: "Alex Morgan", role: "admin" } });
    console.log("Created admin");
  }

  // 2. Ensure member user exists with membershipId
  let member = await prisma.user.findFirst({ where: { email: "member@shim.app" } });
  if (!member) {
    member = await prisma.user.create({ data: { email: "member@shim.app", name: "Jamie Cruz", role: "member", membershipId: "SHIM-2025-0001" } });
    console.log("Created member");
  } else if (!member.membershipId) {
    member = await prisma.user.update({ where: { id: member.id }, data: { membershipId: "SHIM-2025-0001" } });
    console.log("Updated membershipId");
  }

  // 3. Create a template
  let template = await prisma.template.findFirst({ where: { userId: admin.id } });
  if (!template) {
    template = await prisma.template.create({ data: { name: "Standard Certificate", designData: JSON.stringify({ layout: "standard" }), userId: admin.id } });
    console.log("Created template");
  }

  // 4. Create an event
  let event = await prisma.event.findFirst({ where: { organizerId: admin.id } });
  if (!event) {
    event = await prisma.event.create({ data: { name: "Intro to Web Development Workshop", date: new Date("2025-09-15"), defaultRole: "Participant", organizerId: admin.id } });
    console.log("Created event");
  }

  // 5. Create certificate for member@shim.app
  const existing = await prisma.certificate.findFirst({ where: { recipientEmail: "member@shim.app", eventId: event.id } });
  if (!existing) {
    const cert = await prisma.certificate.create({ data: { recipientName: "Jamie Cruz", recipientEmail: "member@shim.app", role: "Participant", status: "valid", issueDate: new Date("2025-09-15"), eventId: event.id, templateId: template.id, issuerId: admin.id } });
    console.log("Certificate created:", cert.id);
  } else {
    console.log("Certificate already exists:", existing.id);
  }

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
