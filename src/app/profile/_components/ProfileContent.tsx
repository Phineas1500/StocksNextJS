"use client";

import React from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function ProfileContent() {
  const { data: portfolio, isLoading } = api.stocks.getPortfolio.useQuery();

  if (isLoading) return <div>Loading portfolio...</div>;
  if (!portfolio) return <div>Error loading portfolio</div>;

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${portfolio.balance.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${portfolio.totalStockValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${portfolio.totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.holdings.length === 0 ? (
              <p className="text-muted-foreground">No stocks in portfolio</p>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                <div className="font-semibold">Symbol</div>
                <div className="font-semibold">Quantity</div>
                <div className="font-semibold">Price</div>
                <div className="font-semibold">Value</div>
                {portfolio.holdings.map((stock) => (
                  <React.Fragment key={stock.symbol}>
                    <div>{stock.symbol}</div>
                    <div>{stock.quantity}</div>
                    <div>${stock.currentPrice.toFixed(2)}</div>
                    <div>${stock.value.toFixed(2)}</div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}