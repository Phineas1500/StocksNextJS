import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { type PrismaClient } from "@prisma/client";
import { type Session } from "next-auth";

export const stocksRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      try {
        console.log("Fetching stocks from database...");
        const stocks = await ctx.db.company.findMany({
          select: {
            id: true,
            symbol: true,
            name: true,
            stockPrices: {
              orderBy: { timestamp: 'desc' },
              take: 1,
              select: {
                price: true,
              },
            },
          },
        });

        console.log("Found stocks:", stocks);

        return stocks.map((stock) => ({
          id: stock.id,
          company: {
            symbol: stock.symbol,
            name: stock.name,
          },
          currentPrice: stock.stockPrices[0]?.price.toNumber() ?? 0,
        }));
      } catch (error) {
        console.error("Error in getAll procedure:", error);
        throw error;
      }
    }),
    buy: protectedProcedure
      .input(z.object({
        stockId: z.string(),
        quantity: z.number().positive()
      }))
      .mutation(async ({ ctx, input }: {
        ctx: { db: PrismaClient; session: Session };
        input: { stockId: string; quantity: number };
      }) => {
        return await ctx.db.$executeRaw`
          CALL BuyStock(${ctx.session.user.id}, ${input.stockId}, ${input.quantity})
        `;
      }),

    sell: protectedProcedure
      .input(z.object({
        stockId: z.string(),
        quantity: z.number().positive()
      }))
      .mutation(async ({ ctx, input }: {
        ctx: { db: PrismaClient; session: Session };
        input: { stockId: string; quantity: number };
      }) => {
        return await ctx.db.$executeRaw`
          CALL SellStock(${ctx.session.user.id}, ${input.stockId}, ${input.quantity})
        `;
      }),
});