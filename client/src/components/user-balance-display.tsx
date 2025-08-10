import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Wallet, Bitcoin } from "lucide-react";

export function UserBalanceDisplay() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatBTC = (amount: string | number) => {
    return Number(amount).toFixed(8);
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Your Balances</h3>
        <p className="text-gray-600">Welcome back, {(user as any)?.username}!</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              <span className="font-medium">CAD Balance</span>
            </div>
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency((user as any)?.cadBalance || "0")}
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Bitcoin className="w-5 h-5 mr-2" />
              <span className="font-medium">BTC Balance</span>
            </div>
          </div>
          <div className="text-2xl font-bold">
            {formatBTC((user as any)?.btcBalance || "0")} BTC
          </div>
        </div>
      </div>
    </Card>
  );
}