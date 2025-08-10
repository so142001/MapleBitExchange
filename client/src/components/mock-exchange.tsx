import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function MockExchange() {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

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

  const buyMutation = useMutation({
    mutationFn: async (cadAmount: number) => {
      return apiRequest("/api/trade/buy", {
        method: "POST",
        body: { cadAmount }
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Buy Order Successful",
        description: `Purchased ${data.transaction.btcAmount.toFixed(8)} BTC for $${data.transaction.cadAmount.toFixed(2)} CAD`,
        variant: "default",
      });
      setBuyAmount("");
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Buy Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async (btcAmount: number) => {
      return apiRequest("/api/trade/sell", {
        method: "POST",
        body: { btcAmount }
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sell Order Successful",
        description: `Sold ${data.transaction.btcAmount.toFixed(8)} BTC for $${data.transaction.cadAmount.toFixed(2)} CAD`,
        variant: "default",
      });
      setSellAmount("");
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Sell Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBuyOrder = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place orders.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(buyAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid CAD amount.",
        variant: "destructive",
      });
      return;
    }

    buyMutation.mutate(amount);
  };

  const handleSellOrder = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place orders.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(sellAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid BTC amount.",
        variant: "destructive",
      });
      return;
    }

    sellMutation.mutate(amount);
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

  if (!isAuthenticated) {
    return (
      <Card className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Bitcoin Trading</h3>
          <p className="text-gray-600 mb-4">Please log in to access the trading interface.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In to Trade
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Bitcoin Trading</h3>
        <div className="flex justify-center space-x-8 text-sm">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-gray-600">CAD Balance: </span>
            <span className="font-semibold text-blue-600">
              ${parseFloat((user as any)?.cadBalance || '0').toFixed(2)}
            </span>
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-lg">
            <span className="text-gray-600">BTC Balance: </span>
            <span className="font-semibold text-orange-600">
              {parseFloat((user as any)?.btcBalance || '0').toFixed(8)} BTC
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Buy Bitcoin */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-success mr-2" />
            <h4 className="text-xl font-bold text-success">Buy Bitcoin</h4>
          </div>
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
              disabled={buyMutation.isPending || !buyAmount}
              className="w-full bg-success text-white hover:bg-green-700 disabled:opacity-50"
            >
              {buyMutation.isPending ? "Processing..." : "Place Buy Order"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Available: ${parseFloat((user as any)?.cadBalance || '0').toFixed(2)} CAD
            </p>
          </div>
        </div>

        {/* Sell Bitcoin */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingDown className="w-6 h-6 text-error mr-2" />
            <h4 className="text-xl font-bold text-error">Sell Bitcoin</h4>
          </div>
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
              disabled={sellMutation.isPending || !sellAmount}
              className="w-full bg-error text-white hover:bg-red-700 disabled:opacity-50"
            >
              {sellMutation.isPending ? "Processing..." : "Place Sell Order"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Available: {parseFloat((user as any)?.btcBalance || '0').toFixed(8)} BTC
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
