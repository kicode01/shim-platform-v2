// Create realistic demo certificates for the member account so the populated
// wallet can be visually verified, then remove them afterwards.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const DEMO = [
  { role: "Participant", event: "Intro to Web Development", tpl: "Standard Certificate", days: 40 },
  { role: "Workshop Attendee", event: "Design Systems Bootcamp", tpl: "Workshop Badge", days: 18 },
  { role: "Speaker", event: "Campus Tech Summit 2026", tpl: "Speaker Award", days: 6 },
];

async function main() {
  const mode = process.argv[2] || "seed";
  const user = await p.user.findUnique({ where: { email: "member@shim.app" } });
  if (!user) throw new Error("member not found");

  if (mode === "clean") {
    const del = await p.certificate.deleteMany({ where: { recipientEmail: "member@shim.app", id: { startsWith: "demowallet" } } });
    console.log("removed", del.count);
    return;
  }

  let org = await p.user.findFirst({ where: { role: "admin" } });
  if (!org) org = await p.user.findFirst();
  let template = await p.template.findFirst({ where: { userId: org.id } });
  if (!template) throw new Error("no template available to attach");

  for (let i = 0; i < DEMO.length; i++) {
    const d = DEMO[i];
    let ev = await p.event.findFirst({ where: { name: d.event } });
    if (!ev) ev = await p.event.create({ data: { name: d.event, organizerId: org.id } });
    const issued = new Date(Date.now() - d.days * 86400000);
    await p.certificate.create({
      data: {
        id: `demowallet${i}${Date.now()}`,
        recipientName: user.name || "Jamie Cruz",
        recipientEmail: "member@shim.app",
        role: d.role,
        status: "valid",
        issueDate: issued,
        eventId: ev.id,
        templateId: template.id,
        issuerId: org.id,
      },
    });
  }
  console.log("seeded", DEMO.length);
}
main().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });
