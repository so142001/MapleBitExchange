import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export function ConversionCalculator() {
  const [fromCurrency, setFromCurrency] = useState("CAD");
  const [toCurrency, setToCurrency] = useState("BTC");
  const [fromAmount, setFromAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("0");

  const { data: rate } = useQuery({
    queryKey: ["/api/rates/current"],
    refetchInterval: 30000,
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const processingFee = Number((settings as any)?.processingFeePercent || 0.5);

  useEffect(() => {
    calculateConversion();
  }, [fromAmount, fromCurrency, toCurrency, rate]);

  const calculateConversion = () => {
    if (!fromAmount || !rate) {
      setConvertedAmount("0");
      return;
    }

    const amount = parseFloat(fromAmount.replace(/,/g, ""));
    if (isNaN(amount)) {
      setConvertedAmount("0");
      return;
    }

    const exchangeRate = parseFloat((rate as any).btcCadRate);
    let result: number;

    if (fromCurrency === "CAD" && toCurrency === "BTC") {
      // CAD to BTC
      const amountAfterFee = amount * (1 - processingFee / 100);
      result = amountAfterFee / exchangeRate;
      setConvertedAmount(result.toFixed(8) + " BTC");
    } else if (fromCurrency === "BTC" && toCurrency === "CAD") {
      // BTC to CAD
      const cadAmount = amount * exchangeRate;
      result = cadAmount * (1 - processingFee / 100);
      setConvertedAmount(new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
      }).format(result));
    } else {
      setConvertedAmount(fromAmount);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount("");
    setConvertedAmount("0");
  };

  const formatNumberInput = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    if (numericValue.includes('.')) {
      const parts = numericValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    } else {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setFromAmount(formatted);
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Currency Converter</h3>
      
      <div className="space-y-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAD">🇨🇦 Canadian Dollar (CAD)</SelectItem>
              <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Amount</Label>
          <Input
            type="text"
            value={fromAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Enter amount"
            className="text-lg font-semibold"
          />
        </div>

        <div className="flex justify-center">
          <Button
            onClick={swapCurrencies}
            className="bg-primary text-white rounded-full p-3 hover:bg-blue-700"
            size="icon"
          >
            <ArrowUpDown className="w-6 h-6" />
          </Button>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">To</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
              <SelectItem value="CAD">🇨🇦 Canadian Dollar (CAD)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Converted Amount</Label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-lg font-bold text-primary">
            {convertedAmount}
          </div>
        </div>

        <Button 
          onClick={calculateConversion}
          className="w-full bg-primary text-white hover:bg-blue-700"
        >
          Calculate Conversion
        </Button>

{rate ? (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Exchange Rate:</span>
                <span>1 BTC = {new Intl.NumberFormat('en-CA', {
                  style: 'currency',
                  currency: 'CAD'
                }).format(Number((rate as any).btcCadRate))}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span>{processingFee}%</span>
              </div>
              <div className="border-t pt-2 font-semibold flex justify-between">
                <span>Total:</span>
                <span>{convertedAmount}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
