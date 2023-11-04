import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "board-title seed data",
      content: "board-content seed data",
      author: "seed",
      password: "1",
    },
  });
  console.log(post);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
