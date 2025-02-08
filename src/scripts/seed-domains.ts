import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

async function createDomainsAndSuperAdmins() {
  const domains = [
    { name: 'Domain A', logo: 'https://example.com/logo-a.png' },
    { name: 'Domain B', logo: 'https://example.com/logo-b.png' },
    { name: 'Domain C', logo: 'https://example.com/logo-c.png' }
  ];

  let superAdminRole = await prisma.role.findUnique({
    where: { name: 'SuperAdmin' }
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        name: 'SuperAdmin'
      }
    });
  }

  for (const domainData of domains) {
    const newDomain = await prisma.domain.create({
      data: {
        name: domainData.name,
        logo: domainData.logo
      }
    });

    console.log(`Created domain: ${newDomain.name}`);

    const superAdminUser = await prisma.user.create({
      data: {
        name: `SuperAdmin for ${newDomain.name}`,
        username: `superadmin_${newDomain.name.toLowerCase().replace(/\s+/g, '_')}`,
        password: await hashPassword('securepassword123'),
        email: `superadmin@${newDomain.name.toLowerCase().replace(/\s+/g, '')}.com`,
        domain: {
          connect: { id: newDomain.id }
        },
        role: {
          connect: { id: superAdminRole.id }
        }
      }
    });

    console.log(`Created SuperAdmin user for domain: ${newDomain.name}`);
  }
}

createDomainsAndSuperAdmins()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
