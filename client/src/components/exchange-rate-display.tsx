import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export function ExchangeRateDisplay() {
  const { data: rate, isLoading, refetch } = useQuery({
    queryKey: ["/api/rates/current"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatChange = (change: string | number) => {
    const changeNum = Number(change);
    const isPositive = changeNum >= 0;
    return (
      <span className={isPositive ? "text-green-300" : "text-red-300"}>
        {isPositive ? "↑" : "↓"} {isPositive ? "+" : ""}{changeNum.toFixed(2)}% (24h)
      </span>
    );
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-CA', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading && !rate) {
    return (
      <Card className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="animate-pulse">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-12">
            <div className="bg-gray-200 rounded-xl p-8 w-64 h-48"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 w-32 h-20"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Live Exchange Rate</h2>
        <p className="text-gray-600">Real-time CAD to Bitcoin conversion rates</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-12">
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-8 text-white">
            <div className="text-sm font-medium mb-2">1 BTC =</div>
            <div className="text-4xl font-bold mb-2">
              {rate ? formatCurrency(rate.btcCadRate) : "Loading..."}
            </div>
            <div className="text-lg">CAD</div>
            <div className="flex items-center justify-center mt-3">
              {rate?.change24h && formatChange(rate.change24h)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-600 text-sm">24h High</div>
            <div className="text-xl font-semibold text-success">
              {rate?.high24h ? formatCurrency(rate.high24h) : "N/A"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-600 text-sm">24h Low</div>
            <div className="text-xl font-semibold text-error">
              {rate?.low24h ? formatCurrency(rate.low24h) : "N/A"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-600 text-sm">Volume</div>
            <div className="text-xl font-semibold">
              {rate?.volume24h ? `$${Number(rate.volume24h).toLocaleString()}` : "N/A"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-600 text-sm">Last Update</div>
            <div className="text-xl font-semibold">{formatTime()}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center space-x-2"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Rate</span>
        </Button>
      </div>
    </Card>
  );
}
