import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
});