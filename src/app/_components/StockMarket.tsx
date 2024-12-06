"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { api } from '~/trpc/react';
import { signIn, useSession } from 'next-auth/react';

interface Stock {
  id: string;
  company: {
    symbol: string;
    name: string;
  };
  currentPrice: number;
}

interface StockMarketProps {
  initialStocks?: Stock[];
}

export const StockMarket: React.FC<StockMarketProps> = ({ initialStocks = [] }) => {
  const [quantity, setQuantity] = useState<string>('');
  const { data: session } = useSession();
  const utils = api.useUtils();
  
  // Use initial data from server and enable real-time updates
  const { data: stocks, isLoading } = api.stocks.getAll.useQuery(undefined, {
    initialData: initialStocks,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
  
  const buyMutation = api.stocks.buy.useMutation({
    onSuccess: () => {
      // Refetch the stocks data
      utils.stocks.getAll.invalidate();
    },
  });
  
  const sellMutation = api.stocks.sell.useMutation({
    onSuccess: () => {
      // Refetch the stocks data
      utils.stocks.getAll.invalidate();
    },
  });
  


  const handleTrade = async (type: 'BUY' | 'SELL', stockId: string) => {
    if (!session) {
      signIn("google");
      return;
    }
  
    try {
      if (type === 'BUY') {
        await buyMutation.mutateAsync({ stockId, quantity: parseInt(quantity) });
      } else {
        await sellMutation.mutateAsync({ stockId, quantity: parseInt(quantity) });
      }
      setQuantity('');
    } catch (error) {
      console.error('Trade failed:', error);
    }
  };

  if (isLoading && !initialStocks.length) return <div>Loading stocks...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Stock Market</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks?.map((stock) => (
          <Card key={stock.id}>
            <CardHeader>
              <CardTitle>{stock.company.symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${stock.currentPrice}</p>
              <p className="text-gray-500">{stock.company.name}</p>
              
              <div className="mt-4 space-y-2">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                  placeholder="Quantity"
                  className="w-full"
                />
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleTrade('BUY', stock.id)}
                    className="w-1/2"
                  >
                    Buy
                  </Button>
                  <Button 
                    onClick={() => handleTrade('SELL', stock.id)}
                    variant="outline"
                    className="w-1/2"
                  >
                    Sell
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};