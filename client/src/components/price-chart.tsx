import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PriceChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  const [period, setPeriod] = useState('24h');

  // Fetch real historical data
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['/api/rates/history', period],
    refetchInterval: 300000, // Update every 5 minutes
    retry: 3,
  });

  useEffect(() => {
    const loadChart = async () => {
      if (!chartRef.current || !historyData) return;

      // Dynamically import Chart.js
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Use real historical data from CoinGecko API
      const chartData = {
        labels: historyData.labels,
        datasets: [{
          label: 'BTC/CAD',
          data: historyData.prices,
          borderColor: 'hsl(210.3, 100%, 42.9%)',
          backgroundColor: 'hsla(210.3, 100%, 42.9%, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4
        }]
      };

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: '#f3f4f6'
              },
              ticks: {
                callback: function(value: any) {
                  return new Intl.NumberFormat('en-CA', {
                    style: 'currency',
                    currency: 'CAD',
                    minimumFractionDigits: 0
                  }).format(value);
                }
              }
            },
            x: {
              grid: {
                color: '#f3f4f6'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    };

    loadChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [historyData]);

  return (
    <Card className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Price History</h3>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={period === '24h' ? 'default' : 'ghost'}
            className={period === '24h' ? "bg-primary text-white" : "text-gray-500 hover:text-gray-700"}
            onClick={() => setPeriod('24h')}
          >
            24H
          </Button>
          <Button 
            size="sm" 
            variant={period === '7d' ? 'default' : 'ghost'}
            className={period === '7d' ? "bg-primary text-white" : "text-gray-500 hover:text-gray-700"}
            onClick={() => setPeriod('7d')}
          >
            7D
          </Button>
          <Button 
            size="sm" 
            variant={period === '30d' ? 'default' : 'ghost'}
            className={period === '30d' ? "bg-primary text-white" : "text-gray-500 hover:text-gray-700"}
            onClick={() => setPeriod('30d')}
          >
            30D
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <canvas ref={chartRef} className="w-full h-full" />
        </div>
      )}

      {historyData && (
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-600 text-sm">Current Period</div>
            <div className="text-lg font-semibold text-primary">{period.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Data Points</div>
            <div className="text-lg font-semibold text-gray-900">{historyData.prices?.length || 0}</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Source</div>
            <div className="text-lg font-semibold text-success">CoinGecko</div>
          </div>
        </div>
      )}
    </Card>
  );
}
