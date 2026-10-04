// Time each Prisma query that portal/page.tsx performs, individually and in
// sequence, to find where the ~5s of latency actually comes from.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const t = async (label, fn) => {
  const t0 = Date.now();
  const out = await fn();
  const ms = Date.now() - t0;
  console.log(label.padEnd(38), String(ms).padStart(6), "ms");
  return out;
};

(async () => {
  const user = await t("user.findUnique", () =>
    p.user.findUnique({ where: { email: "member@shim.app" } })
  );

  await t("wallet.upsert", () =>
    p.wallet.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
  );
  const wallet = await p.wallet.findUnique({ where: { userId: user.id } });

  await t("linkCertificatesToUser (raw updateMany x1)", () =>
    p.certificate.updateMany({
      where: { recipientEmail: user.email, walletId: null },
      data: { walletId: wallet.id },
    })
  );

  const certs = await t("certificate.findMany (include event+template)", () =>
    p.certificate.findMany({
      where: { OR: [{ walletId: wallet.id }, { recipientEmail: user.email }] },
      include: { event: true, template: true },
      orderBy: { issueDate: "desc" },
    })
  );

  await t("attendance.findMany", () => p.attendance.findMany({ where: { email: user.email } }));

  await t("event.findMany", () =>
    p.event.findMany({
      where: { id: { in: [] } },
      select: { name: true, organizer: { select: { name: true } } },
    })
  );

  await t("auditLog.count", () =>
    p.auditLog.count({ where: { action: "VERIFIED", certificateId: { in: certs.map((c) => c.id) } } })
  );

  // Raw latency floor: a trivial query, to isolate network RTT from query cost.
  await t("raw SELECT 1", () => p.$queryRaw`SELECT 1`);

  console.log("\nDATABASE_URL host:", (process.env.DATABASE_URL || "").replace(/:[^:@]*@/, ":***@").slice(0, 80));
  await p.$disconnect();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
