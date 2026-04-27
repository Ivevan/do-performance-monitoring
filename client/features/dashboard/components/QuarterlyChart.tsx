import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface QuarterlyChartProps {
  performanceData: any[];
}

export function QuarterlyChart({ performanceData }: QuarterlyChartProps) {
  // Aggregate Q1, Q2, Q3, Q4 data
  const q1Total = performanceData.reduce((sum, item) => sum + (item.q1 || 0), 0);
  const q2Total = performanceData.reduce((sum, item) => sum + (item.q2 || 0), 0);
  const q3Total = performanceData.reduce((sum, item) => sum + (item.q3 || 0), 0);
  const q4Total = performanceData.reduce((sum, item) => sum + (item.q4 || 0), 0);

  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Actual Achievement',
        data: [q1Total, q2Total, q3Total, q4Total],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[380px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Performance Breakdown</h3>
      <div className="flex-1 relative">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
