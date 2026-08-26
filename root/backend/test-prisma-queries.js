const prisma = require('./prismaClient');

async function main() {
  console.log('\n--- ATHLETES ---');

  const athletes = await prisma.athletes.findMany({
    take: 5
  });

  console.log(athletes);


  console.log('\n--- SESSIONS ---');

  const sessions = await prisma.sessions.findMany({
    take: 5
  });

  console.log(sessions);


  console.log('\n--- ATTENDANCE ---');

  const attendance = await prisma.attendance.findMany({
    take: 5
  });

  console.log(attendance);


  console.log('\n--- SESSION WITH ATTENDANCE + ATHLETE ---');

  const session = await prisma.sessions.findFirst({
    include: {
      attendance: {
        include: {
          athlete: true
        }
      },
      creator: true
    }
  });

  console.log(JSON.stringify(session, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });