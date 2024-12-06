import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import { env } from "~/env";

export const runtime = 'edge';

export async function GET() {
  // Check for authorization
  const headersList = headers();
  const authorization = headersList.get('Authorization');
  
  if (authorization !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating prices:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}