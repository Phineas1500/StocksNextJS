import { createTRPCRouter } from "~/server/api/trpc";
import { stocksRouter } from "~/server/api/routers/stocks";

export const appRouter = createTRPCRouter({
  stocks: stocksRouter,
});

export type AppRouter = typeof appRouter;

