import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MockExchange() {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const { toast } = useToast();

  const { data: rate } = useQuery({
    queryKey: ["/api/rates/current"],
    refetchInterval: 30000,
  });

  const calculateBuyResult = (cadAmount: string) => {
    if (!cadAmount || !rate) return "0.00000000";
    const amount = parseFloat(cadAmount.replace(/,/g, ""));
    if (isNaN(amount)) return "0.00000000";
    
    const exchangeRate = parseFloat((rate as any).btcCadRate);
    const btcAmount = amount / exchangeRate;
    return btcAmount.toFixed(8);
  };

  const calculateSellResult = (btcAmount: string) => {
    if (!btcAmount || !rate) return "$0.00";
    const amount = parseFloat(btcAmount);
    if (isNaN(amount)) return "$0.00";
    
    const exchangeRate = parseFloat((rate as any).btcCadRate);
    const cadAmount = amount * exchangeRate;
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(cadAmount);
  };

  const handleBuyOrder = () => {
    toast({
      title: "Demo Order Placed",
      description: "This is a demonstration. No real transaction was processed.",
      variant: "default",
    });
    setBuyAmount("");
  };

  const handleSellOrder = () => {
    toast({
      title: "Demo Order Placed",
      description: "This is a demonstration. No real transaction was processed.",
      variant: "default",
    });
    setSellAmount("");
  };

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    if (numericValue.includes('.')) {
      const parts = numericValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    } else {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Mock Exchange Interface</h3>
        <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <AlertTriangle className="w-4 h-4 mr-2" />
          DEMO MODE - No Real Transactions
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Buy Bitcoin */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-xl font-bold text-success mb-4">Buy Bitcoin</h4>
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Amount (CAD)</Label>
              <Input
                type="text"
                value={buyAmount}
                onChange={(e) => setBuyAmount(formatCurrencyInput(e.target.value))}
                placeholder="1,000.00"
                className="focus:ring-2 focus:ring-success focus:border-transparent"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">You'll Receive</Label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 font-semibold text-success">
                ~{calculateBuyResult(buyAmount)} BTC
              </div>
            </div>
            <Button 
              onClick={handleBuyOrder}
              className="w-full bg-success text-white hover:bg-green-700"
            >
              Place Buy Order (Demo)
            </Button>
          </div>
        </div>

        {/* Sell Bitcoin */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h4 className="text-xl font-bold text-error mb-4">Sell Bitcoin</h4>
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Amount (BTC)</Label>
              <Input
                type="text"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.01"
                className="focus:ring-2 focus:ring-error focus:border-transparent"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">You'll Receive</Label>
              <div className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 font-semibold text-error">
                ~{calculateSellResult(sellAmount)}
              </div>
            </div>
            <Button 
              onClick={handleSellOrder}
              className="w-full bg-error text-white hover:bg-red-700"
            >
              Place Sell Order (Demo)
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
