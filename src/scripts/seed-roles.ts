import { prisma } from '../lib/prisma';

async function seedRoles() {
  const roles = ['Master', 'SuperAdmin', 'Admin', 'Member'];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName
      }
    });
    console.log(`Role ${roleName} seeded`);
  }
  console.log('Roles seeded successfully');
}

seedRoles()
  .catch((e) => {
    console.error('Error seeding roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
