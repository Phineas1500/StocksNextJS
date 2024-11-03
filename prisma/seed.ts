// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companies = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 180.95 },
    { symbol: 'MSFT', name: 'Microsoft', price: 370.45 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.10 },
    // Add more companies as needed
  ];

  for (const company of companies) {
    const createdCompany = await prisma.company.create({
      data: {
        symbol: company.symbol,
        name: company.name,
        description: `${company.name} stock`,
        stockPrices: {
          create: {
            price: company.price,
          },
        },
      },
    });
    console.log(`Created company: ${createdCompany.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });