import React from "react";
import { ModuleInstance } from "../dashboardStore";
import { useVisualizationData } from "./useVisualizationData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface StockPrice {
  timestamp: string;
  price: number;
}

export interface StockPriceData {
  [ticker: string]: StockPrice[];
}

// Mock data generator
function generateMockPriceData(
  ticker: string,
  days: number,
  startPrice: number,
  volatility: number
): StockPrice[] {
  const data: StockPrice[] = [];
  let currentPrice = startPrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Random walk with volatility
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    currentPrice += change;

    data.push({
      timestamp: date.toISOString().split("T")[0],
      price: Math.max(0.01, currentPrice), // Ensure price doesn't go negative
    });
  }

  return data;
}

async function loadStockPriceData(
  module: ModuleInstance
): Promise<StockPriceData> {
  // Get config values with defaults
  const tickers = (module.config?.tickers as string[]) || ["AAPL"];
  const timeRange = (module.config?.timeRange as string) || "1M";

  // Convert timeRange to number of days
  const daysMap: Record<string, number> = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
  };
  const days = daysMap[timeRange] || 30;

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate mock data for each ticker
      const data: StockPriceData = {};
      tickers.forEach((ticker, index) => {
        // Use different base prices and volatility for different stocks
        const basePrice = 100 * (index + 1);
        const volatility = 0.02 * (index + 1);
        data[ticker] = generateMockPriceData(
          ticker,
          days,
          basePrice,
          volatility
        );
      });
      resolve(data);
    }, 500);
  });
}

interface Props {
  module: ModuleInstance;
}

// Generate a unique color for each ticker
const getTickerColor = (index: number): string => {
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a4de6c"];
  return colors[index % colors.length];
};

export const StockPriceChart: React.FC<Props> = ({ module }) => {
  const { data, isLoading, error } = useVisualizationData<StockPriceData>(
    module,
    loadStockPriceData
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">Loading stock price data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-red-400">Error loading stock price data</p>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">No stock price data available</p>
      </div>
    );
  }

  // Transform data for Recharts
  interface ChartDataPoint {
    timestamp: string;
    [ticker: string]: number | string;
  }

  const chartData = data[Object.keys(data)[0]].map((item) => {
    const dataPoint: ChartDataPoint = { timestamp: item.timestamp };
    Object.keys(data).forEach((ticker) => {
      const tickerData = data[ticker].find(
        (d) => d.timestamp === item.timestamp
      );
      if (tickerData) {
        dataPoint[ticker] = tickerData.price;
      }
    });
    return dataPoint;
  });

  const tickers = Object.keys(data);
  const timeRange = (module.config?.timeRange as string) || "1M";

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-semibold text-gray-300 mb-2">
        Stock Prices ({timeRange})
      </h2>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="timestamp"
              stroke="#888"
              tick={{ fill: "#888" }}
              tickFormatter={(value) => value.split("-").slice(1).join("/")}
            />
            <YAxis
              stroke="#888"
              tick={{ fill: "#888" }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
              }}
              labelStyle={{ color: "#9ca3af" }}
              itemStyle={{ color: "#e5e7eb" }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
            />
            <Legend wrapperStyle={{ color: "#e5e7eb" }} />
            {tickers.map((ticker, index) => (
              <Line
                key={ticker}
                type="monotone"
                dataKey={ticker}
                stroke={getTickerColor(index)}
                dot={false}
                name={ticker}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
