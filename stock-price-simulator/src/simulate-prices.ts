import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function simulatePrices() {
  try {
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
    console.log('Stock prices updated successfully');
  } catch (error: unknown) {
    console.error('Error simulating prices:', error);
    // Add basic retry logic
    setTimeout(simulatePrices, 5000);
  }
}

// Add error handling and reconnection logic
prisma.$connect()
  .then(() => {
    console.log('Connected to database');
    setInterval(simulatePrices, 10000);
    simulatePrices().catch((error: unknown) => console.error('Simulation error:', error));
  })
  .catch((error: unknown) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });