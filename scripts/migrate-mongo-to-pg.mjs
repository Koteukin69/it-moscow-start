/**
 * Migration script: MongoDB → PostgreSQL via Prisma
 *
 * Usage:
 *   1. Export MongoDB collections to ./backup/ (see README below)
 *   2. Set DATABASE_URL in environment
 *   3. Run: node scripts/migrate-mongo-to-pg.mjs
 *
 * Export commands (run with your MONGODB_URI):
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=users            --out=./backup/users.json            --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=quizResults      --out=./backup/quizResults.json      --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=events           --out=./backup/events.json           --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=products         --out=./backup/products.json         --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=orders           --out=./backup/orders.json           --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=carts            --out=./backup/carts.json            --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=consultations    --out=./backup/consultations.json    --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=counters         --out=./backup/counters.json         --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=faq              --out=./backup/faq.json              --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=specialties      --out=./backup/specialties.json      --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=directions       --out=./backup/directions.json       --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=popupSettings    --out=./backup/popupSettings.json    --jsonArray
 *   mongoexport --uri="$MONGODB_URI" --db=db --collection=parentTokenAttempts --out=./backup/parentTokenAttempts.json --jsonArray
 */

import { readFileSync, existsSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function readBackup(name) {
  const path = `./backup/${name}.json`;
  if (!existsSync(path)) {
    console.warn(`  [skip] ${path} not found`);
    return [];
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

function mongoId(doc) {
  return doc._id?.$oid ?? doc._id ?? null;
}

function mongoDate(val) {
  if (!val) return new Date();
  if (val.$date) return new Date(val.$date);
  if (typeof val === "string") return new Date(val);
  return new Date(val);
}

async function migrateUsers() {
  const docs = readBackup("users");
  console.log(`Users: ${docs.length} documents`);
  for (const doc of docs) {
    const id = mongoId(doc);
    if (!id) continue;
    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        name: doc.name ?? "Пользователь",
        coins: doc.coins ?? 0,
        avatar: doc.avatar ?? null,
        oauthProviders: doc.oauthProviders ?? [],
        gameSession: doc.gameSession ?? null,
        createdAt: doc.createdAt ? mongoDate(doc.createdAt) : new Date(),
      },
      update: {},
    });
  }
  console.log("  ✓ Users done");
}

async function migrateQuizResults() {
  const docs = readBackup("quizResults");
  console.log(`QuizResults: ${docs.length} documents`);
  for (const doc of docs) {
    const id = mongoId(doc);
    if (!id || !doc.userId) continue;
    const userExists = await prisma.user.findUnique({ where: { id: doc.userId } });
    if (!userExists) { console.warn(`  [skip] quizResult userId not found: ${doc.userId}`); continue; }
    await prisma.quizResult.upsert({
      where: { userId: doc.userId },
      create: {
        id,
        userId: doc.userId,
        directions: doc.directions ?? {},
        top: Array.isArray(doc.top) ? doc.top : [],
        completedAt: mongoDate(doc.completedAt),
      },
      update: {
        directions: doc.directions ?? {},
        top: Array.isArray(doc.top) ? doc.top : [],
        completedAt: mongoDate(doc.completedAt),
      },
    });
  }
  console.log("  ✓ QuizResults done");
}

async function migrateEvents() {
  const docs = readBackup("events");
  console.log(`Events: ${docs.length} documents`);
  for (const doc of docs) {
    const id = mongoId(doc);
    if (!id) continue;
    await prisma.event.upsert({
      where: { id },
      create: {
        id,
        name: doc.name ?? "",
        date: doc.date ?? "",
        image: doc.image ?? null,
        description: doc.description ?? "",
        registrationUrl: doc.registrationUrl ?? null,
      },
      update: {},
    });
  }
  console.log("  ✓ Events done");
}

async function migrateProducts() {
  const docs = readBackup("products");
  console.log(`Products: ${docs.length} documents`);
  for (const doc of docs) {
    const id = mongoId(doc);
    if (!id) continue;
    await prisma.product.upsert({
      where: { id },
      create: {
        id,
        name: doc.name ?? "",
        price: doc.price ?? 0,
        description: doc.description ?? "",
        images: Array.isArray(doc.images) ? doc.images : (doc.image ? [doc.image] : []),
        stock: doc.stock ?? null,
        variants: doc.variants ?? null,
        variantLabel: doc.variantLabel ?? null,
        isNew: doc.isNew ?? false,
      },
      update: {},
    });
  }
  console.log("  ✓ Products done");
}

async function migrateOrders() {
  const docs = readBackup("orders");
  console.log(`Orders: ${docs.length} documents`);
  for (const doc of docs) {
    const id = mongoId(doc);
    if (!id) continue;
    const userExists = await prisma.user.findUnique({ where: { id: doc.userId } });
    const productExists = await prisma.product.findUnique({ where: { id: doc.productId } });
    if (!userExists) { console.warn(`  [skip] order userId not found: ${doc.userId}`); continue; }
    if (!productExists) { console.warn(`  [skip] order productId not found: ${doc.productId}`); continue; }
    await prisma.order.upsert({
      where: { id },
      create: {
        id,
        orderNumber: doc.orderNumber ?? 0,
        pickupCode: doc.pickupCode ?? "",
        userId: doc.userId,
        userName: doc.userName ?? "",
        phone: doc.phone ?? null,
        productId: doc.productId,
        productName: doc.productName ?? "",
        variant: doc.variant ?? null,
        quantity: doc.quantity ?? 1,
        price: doc.price ?? 0,
        status: ["pending", "completed", "cancelled"].includes(doc.status) ? doc.status : "pending",
        createdAt: mongoDate(doc.createdAt),
      },
      update: {},
    });
  }
  console.log("  ✓ Orders done");
}

async function migrateCarts() {
  const docs = readBackup("carts");
  console.log(`Carts: ${docs.length} documents`);
  for (const doc of docs) {
    if (!doc.userId) continue;
    const userExists = await prisma.user.findUnique({ where: { id: doc.userId } });
    if (!userExists) { console.warn(`  [skip] cart userId not found: ${doc.userId}`); continue; }
    await prisma.cart.upsert({
      where: { userId: doc.userId },
      create: {
        userId: doc.userId,
        items: Array.isArray(doc.items) ? doc.items : [],
        updatedAt: mongoDate(doc.updatedAt),
      },
      update: {
        items: Array.isArray(doc.items) ? doc.items : [],
      },
    });
  }
  console.log("  ✓ Carts done");
}

async function migrateConsultations() {
  const docs = readBackup("consultations");
  console.log(`Consultations: ${docs.length} documents`);
  for (const doc of docs) {
    const id = mongoId(doc);
    if (!id) continue;
    await prisma.consultation.upsert({
      where: { id },
      create: {
        id,
        name: doc.name ?? "",
        phone: doc.phone ?? "",
        childName: doc.childName ?? "",
        specialty: doc.specialty ?? "",
        grade: doc.grade ?? "",
        flames: doc.flames ?? 3,
        sessionId: doc.sessionId ?? null,
        createdAt: mongoDate(doc.createdAt),
      },
      update: {},
    });
  }
  console.log("  ✓ Consultations done");
}

async function migrateCounters() {
  const docs = readBackup("counters");
  console.log(`Counters: ${docs.length} documents`);
  for (const doc of docs) {
    const id = doc._id?.$oid ?? doc._id;
    if (!id) continue;
    await prisma.counter.upsert({
      where: { id },
      create: { id, seq: doc.seq ?? 0 },
      update: { seq: doc.seq ?? 0 },
    });
  }
  console.log("  ✓ Counters done");
}

async function migrateFaq() {
  const docs = readBackup("faq");
  console.log(`Faq: ${docs.length} documents`);
  for (const doc of docs) {
    const id = mongoId(doc);
    if (!id) continue;
    await prisma.faq.upsert({
      where: { id },
      create: { id, question: doc.question ?? "", answer: doc.answer ?? "" },
      update: {},
    });
  }
  console.log("  ✓ Faq done");
}

async function migrateSpecialties() {
  const docs = readBackup("specialties");
  console.log(`Specialties: ${docs.length} documents`);
  for (const doc of docs) {
    if (!doc.id) continue;
    await prisma.specialty.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        code: doc.code ?? "",
        title: doc.title ?? "",
        description: doc.description ?? "",
        relevance: doc.relevance ?? "",
        curriculum: Array.isArray(doc.curriculum) ? doc.curriculum : [],
        targetAudience: Array.isArray(doc.targetAudience) ? doc.targetAudience : [],
        careers: Array.isArray(doc.careers) ? doc.careers : [],
        image: doc.image ?? "",
        icons: Array.isArray(doc.icons) ? doc.icons : [],
        orb: doc.orb ?? "cyan",
        budgetPlaces: doc.budgetPlaces ?? null,
      },
      update: {
        code: doc.code ?? "",
        title: doc.title ?? "",
        description: doc.description ?? "",
        relevance: doc.relevance ?? "",
        curriculum: Array.isArray(doc.curriculum) ? doc.curriculum : [],
        targetAudience: Array.isArray(doc.targetAudience) ? doc.targetAudience : [],
        careers: Array.isArray(doc.careers) ? doc.careers : [],
        image: doc.image ?? "",
        icons: Array.isArray(doc.icons) ? doc.icons : [],
        orb: doc.orb ?? "cyan",
        budgetPlaces: doc.budgetPlaces ?? null,
      },
    });
  }
  console.log("  ✓ Specialties done");
}

async function migrateDirections() {
  const docs = readBackup("directions");
  console.log(`Directions: ${docs.length} documents`);
  for (const doc of docs) {
    if (!doc.id) continue;
    await prisma.direction.upsert({
      where: { id: doc.id },
      create: {
        id: doc.id,
        code: doc.code ?? "",
        name: doc.name ?? "",
        description: doc.description ?? "",
        image: doc.image ?? "",
        budget: doc.budget ?? null,
        forField: Array.isArray(doc.for) ? doc.for : [],
        become: Array.isArray(doc.become) ? doc.become : [],
        program: Array.isArray(doc.program) ? doc.program : [],
        category: doc.category ?? "",
        align: doc.align ?? "left",
      },
      update: {
        code: doc.code ?? "",
        name: doc.name ?? "",
        description: doc.description ?? "",
        image: doc.image ?? "",
        budget: doc.budget ?? null,
        forField: Array.isArray(doc.for) ? doc.for : [],
        become: Array.isArray(doc.become) ? doc.become : [],
        program: Array.isArray(doc.program) ? doc.program : [],
        category: doc.category ?? "",
        align: doc.align ?? "left",
      },
    });
  }
  console.log("  ✓ Directions done");
}

async function migratePopupSettings() {
  const docs = readBackup("popupSettings");
  console.log(`PopupSettings: ${docs.length} documents`);
  for (const doc of docs) {
    if (!doc.key) continue;
    await prisma.popupSettings.upsert({
      where: { key: doc.key },
      create: {
        key: doc.key,
        image: doc.image ?? "",
        title: doc.title ?? "",
        subtitle: doc.subtitle ?? "",
        description: doc.description ?? "",
        buttonUrl: doc.buttonUrl ?? null,
        delaySeconds: doc.delaySeconds ?? null,
        repeatDelaySeconds: doc.repeatDelaySeconds ?? null,
      },
      update: {
        image: doc.image ?? "",
        title: doc.title ?? "",
        subtitle: doc.subtitle ?? "",
        description: doc.description ?? "",
        buttonUrl: doc.buttonUrl ?? null,
        delaySeconds: doc.delaySeconds ?? null,
        repeatDelaySeconds: doc.repeatDelaySeconds ?? null,
      },
    });
  }
  console.log("  ✓ PopupSettings done");
}

async function migrateParentTokenAttempts() {
  const docs = readBackup("parentTokenAttempts");
  console.log(`ParentTokenAttempts: ${docs.length} documents`);
  for (const doc of docs) {
    const id = mongoId(doc);
    if (!id) continue;
    await prisma.parentTokenAttempt.upsert({
      where: { id },
      create: {
        id,
        ip: doc.ip ?? "",
        token: doc.token ?? "",
        createdAt: mongoDate(doc.createdAt),
      },
      update: {},
    });
  }
  console.log("  ✓ ParentTokenAttempts done");
}

async function main() {
  console.log("Starting MongoDB → PostgreSQL migration...\n");

  await migrateUsers();
  await migrateQuizResults();
  await migrateEvents();
  await migrateProducts();
  await migrateOrders();
  await migrateCarts();
  await migrateConsultations();
  await migrateCounters();
  await migrateFaq();
  await migrateSpecialties();
  await migrateDirections();
  await migratePopupSettings();
  await migrateParentTokenAttempts();

  console.log("\n✅ Migration complete!");
}

main()
  .catch(err => { console.error("Migration failed:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
