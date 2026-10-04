// Remove the QA-ROLE-TEST-EVENT row created by scratch/qa-role-guard.js.
// Scoped by BOTH id and exact name so it can never delete anything else.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const id = "cmutf7zw500m4u59przjvyzir";
  const hit = await prisma.event.findFirst({ where: { id, name: "QA-ROLE-TEST-EVENT" } });
  if (!hit) {
    console.log("nothing to clean up (row not found)");
    await prisma.$disconnect();
    return;
  }
  const certs = await prisma.certificate.count({ where: { eventId: id } });
  const att = await prisma.attendance.count({ where: { eventId: id } });
  console.log("found:", JSON.stringify({ id: hit.id, name: hit.name, certs, attendance: att }));
  await prisma.event.delete({ where: { id } });
  const after = await prisma.event.findFirst({ where: { id } });
  console.log("deleted. still present:", !!after);
  await prisma.$disconnect();
})().catch(async (e) => { console.error("ERR", e.message); await prisma.$disconnect(); process.exit(1); });
