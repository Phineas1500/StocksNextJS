import { headers } from "next/headers";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";

const createCaller = async () => {
  const ctx = await createTRPCContext({
    headers: headers(),
  });
  
  return appRouter.createCaller(ctx);
};

export const api = {
  stocks: {
    getAll: {
      query: async () => {
        const caller = await createCaller();
        return caller.stocks.getAll();
      },
    },
  },
};