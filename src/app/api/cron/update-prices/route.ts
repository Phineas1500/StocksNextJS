import { db } from "~/server/db";
import { NextResponse } from "next/server";

// Reuse the same simulation logic from your simulate-prices.ts
async function simulatePrices() {
  try {
    const companies = await db.company.findMany();

    for (const company of companies) {
      const lastPrice = await db.stockPrice.findFirst({
        where: { companyId: company.id },
        orderBy: { timestamp: 'desc' },
      });

      if (lastPrice) {
        const change = (Math.random() - 0.5) * 2;
        const newPrice = Math.max(0.01, lastPrice.price.toNumber() * (1 + change * 0.02));

        await db.stockPrice.create({
          data: {
            companyId: company.id,
            price: newPrice,
          },
        });
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Error simulating prices:', error);
    return { success: false, error: String(error) };
  }
}

export async function GET() {
  const result = await simulatePrices();
  return NextResponse.json(result);
}