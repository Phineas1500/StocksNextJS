// scripts/simulate-prices.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulatePrices() {
  const companies = await prisma.company.findMany();

  for (const company of companies) {
    const lastPrice = await prisma.stockPrice.findFirst({
      where: { companyId: company.id },
      orderBy: { timestamp: 'desc' },
    });

    if (lastPrice) {
      const change = (Math.random() - 0.5) * 2; // -1 to 1
      const newPrice = Math.max(0.01, lastPrice.price.toNumber() * (1 + change * 0.02));

      await prisma.stockPrice.create({
        data: {
          companyId: company.id,
          price: newPrice,
        },
      });
    }
  }
}

// Run every minute
setInterval(simulatePrices, 60000);
simulatePrices().catch(console.error);