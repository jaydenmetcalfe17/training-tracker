const prisma = require('./prismaClient');

async function main() {
  const result = await prisma.athletes.count();
  console.log(`Athletes: ${result}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });