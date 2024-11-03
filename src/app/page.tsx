import { unstable_noStore as noStore } from "next/cache";
import { api } from "~/trpc/server";
import { StockMarket } from "./_components/StockMarket";
import { SignInButton } from "~/components/auth/SignInButton";

export default async function Home() {
  noStore();
  
  try {
    console.log("Starting to fetch stocks...");
    const stocks = await api.stocks.getAll.query();
    console.log("Fetched stocks successfully:", stocks);
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="flex w-full justify-end">
            <SignInButton />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Stock <span className="text-[hsl(280,100%,70%)]">Market</span>
          </h1>
          {stocks ? (
            <StockMarket initialStocks={stocks} />
          ) : (
            <div>No stocks found</div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div>Error loading stocks: {error instanceof Error ? error.message : 'Unknown error'}</div>
        <pre className="mt-2 text-sm text-red-500">
          {error instanceof Error ? error.stack : ''}
        </pre>
      </main>
    );
  }
}