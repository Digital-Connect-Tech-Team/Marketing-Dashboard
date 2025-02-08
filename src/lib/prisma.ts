import { PrismaClient } from '@prisma/client';

// ใช้ global object เพื่อป้องกันปัญหา Prisma Client ถูกสร้างหลายครั้งในระหว่างพัฒนา (hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// ตรวจสอบว่ามี Prisma Client อยู่ใน global object แล้วหรือไม่
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'] // ตั้งค่าการ log เพื่อ debug (ถ้าต้องการ)
  });

// เก็บ Prisma Client ไว้ใน global object เฉพาะในโหมด development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
