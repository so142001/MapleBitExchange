import { Header } from "@/components/header";
import { ExchangeRateDisplay } from "@/components/exchange-rate-display";
import { ConversionCalculator } from "@/components/conversion-calculator";
import { PriceChart } from "@/components/price-chart";
import { MockExchange } from "@/components/mock-exchange";
import { UserBalanceDisplay } from "@/components/user-balance-display";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-light">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserBalanceDisplay />
        <ExchangeRateDisplay />
        
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <ConversionCalculator />
          <PriceChart />
        </div>
        
        <MockExchange />
      </main>
    </div>
  );
}
