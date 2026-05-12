import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_NAME = process.env.MONGODB_NAME ?? "db";
const DATABASE_URL = process.env.DATABASE_URL;

if (!MONGODB_URI || !DATABASE_URL) {
  console.error("Missing MONGODB_URI or DATABASE_URL");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const mongo = new MongoClient(MONGODB_URI);

function toId(v) {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (v?.$oid) return v.$oid;
  return String(v);
}

function toDate(v) {
  if (!v) return new Date();
  if (v instanceof Date) return v;
  if (v?.$date) return new Date(v.$date);
  return new Date(v);
}

async function run() {
  await mongo.connect();
  const db = mongo.db(MONGODB_NAME);

  // 1. Users
  console.log("Migrating users...");
  const users = await db.collection("users").find({}).toArray();
  let userCount = 0;
  for (const u of users) {
    const id = toId(u._id);
    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        name: u.name ?? "",
        coins: u.coins ?? 0,
        avatar: u.avatar ?? null,
        oauthProviders: u.oauthProviders ?? [],
        gameSession: u.gameSession ?? null,
        createdAt: toDate(u.createdAt),
      },
      update: {
        name: u.name ?? "",
        coins: u.coins ?? 0,
        avatar: u.avatar ?? null,
        oauthProviders: u.oauthProviders ?? [],
        gameSession: u.gameSession ?? null,
      },
    });
    userCount++;
  }
  console.log(`  -> ${userCount} users`);

  // 2. QuizResults
  console.log("Migrating quizResults...");
  const quizResults = await db.collection("quizResults").find({}).toArray();
  let qCount = 0;
  for (const q of quizResults) {
    const userId = toId(q.userId);
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) { console.log(`  skip quiz for missing user ${userId}`); continue; }
    await prisma.quizResult.upsert({
      where: { userId },
      create: {
        id: toId(q._id),
        userId,
        directions: q.directions ?? {},
        top: q.top ?? [],
        completedAt: toDate(q.completedAt),
      },
      update: {
        directions: q.directions ?? {},
        top: q.top ?? [],
        completedAt: toDate(q.completedAt),
      },
    });
    qCount++;
  }
  console.log(`  -> ${qCount} quizResults`);

  // 3. Events
  console.log("Migrating events...");
  const events = await db.collection("events").find({}).toArray();
  let eCount = 0;
  for (const e of events) {
    const id = toId(e._id);
    await prisma.event.upsert({
      where: { id },
      create: {
        id,
        name: e.name ?? "",
        date: e.date ?? "",
        image: e.image ?? null,
        description: e.description ?? "",
        registrationUrl: e.registrationUrl ?? null,
      },
      update: {
        name: e.name ?? "",
        date: e.date ?? "",
        image: e.image ?? null,
        description: e.description ?? "",
        registrationUrl: e.registrationUrl ?? null,
      },
    });
    eCount++;
  }
  console.log(`  -> ${eCount} events`);

  // 4. Products
  console.log("Migrating products...");
  const products = await db.collection("products").find({}).toArray();
  let pCount = 0;
  for (const p of products) {
    const id = toId(p._id);
    await prisma.product.upsert({
      where: { id },
      create: {
        id,
        name: p.name ?? "",
        price: p.price ?? 0,
        description: p.description ?? "",
        images: p.images ?? [],
        stock: p.stock ?? null,
        variants: p.variants ?? null,
        variantLabel: p.variantLabel ?? null,
        isNew: p.isNew ?? false,
      },
      update: {
        name: p.name ?? "",
        price: p.price ?? 0,
        description: p.description ?? "",
        images: p.images ?? [],
        stock: p.stock ?? null,
        variants: p.variants ?? null,
        variantLabel: p.variantLabel ?? null,
        isNew: p.isNew ?? false,
      },
    });
    pCount++;
  }
  console.log(`  -> ${pCount} products`);

  // 5. Carts
  console.log("Migrating carts...");
  const carts = await db.collection("carts").find({}).toArray();
  let cCount = 0;
  for (const c of carts) {
    const userId = toId(c.userId);
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) { console.log(`  skip cart for missing user ${userId}`); continue; }
    await prisma.cart.upsert({
      where: { userId },
      create: {
        id: toId(c._id),
        userId,
        items: c.items ?? [],
        updatedAt: toDate(c.updatedAt),
      },
      update: {
        items: c.items ?? [],
        updatedAt: toDate(c.updatedAt),
      },
    });
    cCount++;
  }
  console.log(`  -> ${cCount} carts`);

  // 6. Orders
  console.log("Migrating orders...");
  const orders = await db.collection("orders").find({}).sort({ createdAt: 1 }).toArray();
  let oCount = 0;
  for (const o of orders) {
    const id = toId(o._id);
    const userId = toId(o.userId);
    const productId = toId(o.productId);
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    const productExists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!userExists || !productExists) {
      console.log(`  skip order ${id}: missing user or product`);
      continue;
    }
    const existing = await prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (existing) { oCount++; continue; }
    await prisma.order.create({
      data: {
        id,
        orderNumber: o.orderNumber ?? 0,
        pickupCode: o.pickupCode ?? "",
        userId,
        userName: o.userName ?? "",
        phone: o.phone ?? null,
        productId,
        productName: o.productName ?? "",
        variant: o.variant ?? null,
        quantity: o.quantity ?? 1,
        price: o.price ?? 0,
        status: o.status ?? "pending",
        createdAt: toDate(o.createdAt),
      },
    });
    oCount++;
  }
  console.log(`  -> ${oCount} orders`);

  // 7. Consultations
  console.log("Migrating consultations...");
  const consultations = await db.collection("consultations").find({}).toArray();
  let conCount = 0;
  for (const c of consultations) {
    const id = toId(c._id);
    const existing = await prisma.consultation.findUnique({ where: { id }, select: { id: true } });
    if (existing) { conCount++; continue; }
    await prisma.consultation.create({
      data: {
        id,
        name: c.name ?? "",
        phone: c.phone ?? "",
        childName: c.childName ?? "",
        specialty: c.specialty ?? "",
        grade: c.grade ?? "",
        flames: c.flames ?? 3,
        sessionId: c.sessionId ?? null,
        createdAt: toDate(c.createdAt),
      },
    });
    conCount++;
  }
  console.log(`  -> ${conCount} consultations`);

  // 8. Counters
  console.log("Migrating counters...");
  const counters = await db.collection("counters").find({}).toArray();
  for (const c of counters) {
    const id = typeof c._id === "string" ? c._id : (c._id?.$oid ?? String(c._id));
    await prisma.counter.upsert({
      where: { id },
      create: { id, seq: c.seq ?? 0 },
      update: { seq: c.seq ?? 0 },
    });
  }
  console.log(`  -> ${counters.length} counters`);

  // 9. FAQ
  console.log("Migrating faq...");
  const faqs = await db.collection("faq").find({}).toArray();
  let fCount = 0;
  for (const f of faqs) {
    const id = toId(f._id);
    await prisma.faq.upsert({
      where: { id },
      create: { id, question: f.question ?? "", answer: f.answer ?? "" },
      update: { question: f.question ?? "", answer: f.answer ?? "" },
    });
    fCount++;
  }
  console.log(`  -> ${fCount} faqs`);

  // 10. Specialties
  console.log("Migrating specialties...");
  const specialties = await db.collection("specialties").find({}).toArray();
  let sCount = 0;
  for (const s of specialties) {
    const id = toId(s._id);
    await prisma.specialty.upsert({
      where: { id },
      create: {
        id,
        code: s.code ?? "",
        title: s.title ?? "",
        description: s.description ?? "",
        relevance: s.relevance ?? "",
        curriculum: s.curriculum ?? [],
        targetAudience: s.targetAudience ?? [],
        careers: s.careers ?? [],
        image: s.image ?? "",
        icons: s.icons ?? [],
        orb: s.orb ?? "cyan",
        budgetPlaces: s.budgetPlaces ?? null,
      },
      update: {
        code: s.code ?? "",
        title: s.title ?? "",
        description: s.description ?? "",
        relevance: s.relevance ?? "",
        curriculum: s.curriculum ?? [],
        targetAudience: s.targetAudience ?? [],
        careers: s.careers ?? [],
        image: s.image ?? "",
        icons: s.icons ?? [],
        orb: s.orb ?? "cyan",
        budgetPlaces: s.budgetPlaces ?? null,
      },
    });
    sCount++;
  }
  console.log(`  -> ${sCount} specialties`);

  // 11. Directions
  console.log("Migrating directions...");
  const directions = await db.collection("directions").find({}).toArray();
  let dCount = 0;
  for (const d of directions) {
    const id = toId(d._id);
    await prisma.direction.upsert({
      where: { id },
      create: {
        id,
        code: d.code ?? "",
        name: d.name ?? "",
        description: d.description ?? "",
        image: d.image ?? "",
        budget: d.budget ?? null,
        forField: d.for ?? d.forField ?? [],
        become: d.become ?? [],
        program: d.program ?? [],
        category: d.category ?? "",
        align: d.align ?? "",
      },
      update: {
        code: d.code ?? "",
        name: d.name ?? "",
        description: d.description ?? "",
        image: d.image ?? "",
        budget: d.budget ?? null,
        forField: d.for ?? d.forField ?? [],
        become: d.become ?? [],
        program: d.program ?? [],
        category: d.category ?? "",
        align: d.align ?? "",
      },
    });
    dCount++;
  }
  console.log(`  -> ${dCount} directions`);

  // 12. PopupSettings
  console.log("Migrating popupSettings...");
  const popups = await db.collection("popupSettings").find({}).toArray();
  for (const p of popups) {
    const key = p.key ?? toId(p._id);
    await prisma.popupSettings.upsert({
      where: { key },
      create: {
        key,
        image: p.image ?? "",
        title: p.title ?? "",
        subtitle: p.subtitle ?? "",
        description: p.description ?? "",
        buttonUrl: p.buttonUrl ?? null,
        delaySeconds: p.delaySeconds ?? null,
        repeatDelaySeconds: p.repeatDelaySeconds ?? null,
      },
      update: {
        image: p.image ?? "",
        title: p.title ?? "",
        subtitle: p.subtitle ?? "",
        description: p.description ?? "",
        buttonUrl: p.buttonUrl ?? null,
        delaySeconds: p.delaySeconds ?? null,
        repeatDelaySeconds: p.repeatDelaySeconds ?? null,
      },
    });
  }
  console.log(`  -> ${popups.length} popupSettings`);

  // 13. ParentTokenAttempts
  console.log("Migrating parentTokenAttempts...");
  const attempts = await db.collection("parentTokenAttempts").find({}).toArray();
  let aCount = 0;
  for (const a of attempts) {
    const id = toId(a._id);
    const existing = await prisma.parentTokenAttempt.findUnique({ where: { id }, select: { id: true } });
    if (existing) { aCount++; continue; }
    await prisma.parentTokenAttempt.create({
      data: {
        id,
        ip: a.ip ?? "",
        token: a.token ?? "",
        createdAt: toDate(a.createdAt),
      },
    });
    aCount++;
  }
  console.log(`  -> ${aCount} parentTokenAttempts`);

  console.log("\nMigration complete!");
  await mongo.close();
  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await mongo.close();
  await prisma.$disconnect();
  process.exit(1);
});
