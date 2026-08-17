import prisma from '../config/db';

export async function generateUniqueOrderNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `DH-${currentYear}`;

  // Count existing orders for this year to format sequential ID with fallback randomness
  const count = await prisma.order.count({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
  });

  const nextSeq = count + 1;
  const formattedSeq = String(nextSeq).padStart(5, '0');
  let orderNumber = `${prefix}-${formattedSeq}`;

  // Ensure uniqueness
  let existing = await prisma.order.findUnique({ where: { orderNumber } });
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    orderNumber = `${prefix}-${formattedSeq}-${randomSuffix}`;
  }

  return orderNumber;
}
