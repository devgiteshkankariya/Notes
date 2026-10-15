import { prisma } from './prisma.js';
import { seedUserData } from './routes/auth.js';

async function main() {
  console.log('🌱 Seeding database...');

  const demoEmail = 'demo@notekeep.local';
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        password: 'demouserhashpassword',
        name: 'Demo User',
      },
    });
    console.log(`Created default demo user: ${demoEmail}`);
  }

  await seedUserData(demoUser.id);
  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
