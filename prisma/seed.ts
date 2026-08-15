import { PrismaClient } from "@prisma/client";
import austin from "../data/seed/austin-decorators.json";

const prisma = new PrismaClient();

async function main() {
  for (const decorator of austin) {
    await prisma.decoratorRecord.upsert({
      where: { id: decorator.id },
      create: {
        id: decorator.id,
        city: decorator.city,
        decoratorJson: JSON.stringify(decorator),
        lastIndexedAt: new Date(decorator.lastIndexedAt),
      },
      update: {
        decoratorJson: JSON.stringify(decorator),
        lastIndexedAt: new Date(decorator.lastIndexedAt),
      },
    });
  }
  await prisma.cityIndex.upsert({
    where: { city: "Austin, TX" },
    create: {
      city: "Austin, TX",
      lastCrawledAt: new Date(),
      decoratorCount: austin.length,
    },
    update: {
      lastCrawledAt: new Date(),
      decoratorCount: austin.length,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
