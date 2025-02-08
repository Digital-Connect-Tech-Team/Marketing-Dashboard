import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';

async function createMasterAccount() {
  let masterRole = await prisma.role.findUnique({
    where: { name: 'Master' }
  });

  if (!masterRole) {
    masterRole = await prisma.role.create({
      data: {
        name: 'Master'
      }
    });
    console.log('Role "Master" created');
  }

  // ตรวจสอบว่ามีบัญชี Master อยู่หรือไม่
  const existingMaster = await prisma.user.findUnique({
    where: { email: 'master@example.com' }
  });

  if (existingMaster) {
    console.log('Master account already exists');
    return;
  }

  // สร้างบัญชี Master
  const masterUser = await prisma.user.create({
    data: {
      name: 'Master User',
      username: 'masteruser',
      password: await hashPassword('securepassword123'), // ใช้ฟังก์ชัน hash password
      email: 'master@example.com',
      role: {
        connect: { id: masterRole.id }
      }
    }
  });

  console.log('Master account created:', masterUser);
}

createMasterAccount()
  .catch((e) => {
    console.error('Error creating Master account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
