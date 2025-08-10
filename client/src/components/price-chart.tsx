import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PriceChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const loadChart = async () => {
      if (!chartRef.current) return;

      // Dynamically import Chart.js
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Mock data for demonstration
      const mockData = {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        datasets: [{
          label: 'BTC/CAD',
          data: [67200, 67800, 67400, 67845, 68100, 67900, 67845],
          borderColor: 'hsl(210.3, 100%, 42.9%)',
          backgroundColor: 'hsla(210.3, 100%, 42.9%, 0.1)',
          fill: true,
          tension: 0.4
        }]
      };

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: mockData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: '#f3f4f6'
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
  }, []);

  return (
    <Card className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Price History</h3>
        <div className="flex space-x-2">
          <Button size="sm" className="bg-primary text-white">24H</Button>
          <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700">7D</Button>
          <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700">30D</Button>
        </div>
      </div>
      
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <canvas ref={chartRef} className="w-full h-full" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-gray-600 text-sm">24h Change</div>
          <div className="text-lg font-semibold text-success">+2.34%</div>
        </div>
        <div>
          <div className="text-gray-600 text-sm">7d Change</div>
          <div className="text-lg font-semibold text-error">-1.23%</div>
        </div>
        <div>
          <div className="text-gray-600 text-sm">30d Change</div>
          <div className="text-lg font-semibold text-success">+8.91%</div>
        </div>
      </div>
    </Card>
  );
}
