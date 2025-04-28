import React from "react";
import { ModuleInstance } from "../dashboardStore";
import { useVisualizationData } from "./useVisualizationData";

export interface AssetPosition {
  symbol: string;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

export interface PortfolioSummaryData {
  totalValue: string;
  dailyChange: string;
  timestamp: string;
  assets: AssetPosition[];
}

async function loadPortfolioData(
  module: ModuleInstance
): Promise<PortfolioSummaryData> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalValue: "5,250,430.80",
        dailyChange: "+1.25% (+ $64,820.15) Today",
        timestamp: "27 Apr 2025, 1:30 PM BST",
        assets: [
          {
            symbol: "AAPL",
            name: "Apple Inc.",
            value: "1,250,430.50",
            change: "15,430.20",
            changePercent: "1.25",
            isPositive: true,
          },
          {
            symbol: "GOOGL",
            name: "Alphabet Inc.",
            value: "980,250.30",
            change: "-8,720.40",
            changePercent: "0.88",
            isPositive: false,
          },
          {
            symbol: "MSFT",
            name: "Microsoft Corp.",
            value: "875,340.60",
            change: "12,340.80",
            changePercent: "1.43",
            isPositive: true,
          },
        ],
      });
    }, 500);
  });
}

interface Props {
  module: ModuleInstance;
}

export const PortfolioSummary: React.FC<Props> = ({ module }) => {
  const { data, isLoading, error } = useVisualizationData<PortfolioSummaryData>(
    module,
    loadPortfolioData
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">Loading portfolio data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-red-400">Error loading portfolio data</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-300 mb-2">
          Portfolio Overview
        </h2>
        <p className="text-3xl font-bold text-white">
          ${data?.totalValue ?? "0.00"}
        </p>
        <p className="text-sm text-green-400 mt-1">
          {data?.dailyChange ?? "No change"}
        </p>
      </div>

      <div className="flex-grow">
        <h3 className="text-md font-semibold text-gray-400 mb-3">Assets</h3>
        <div className="space-y-3">
          {data?.assets.map((asset) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between border-b border-gray-700 pb-2"
            >
              <div>
                <p className="text-white font-medium">{asset.symbol}</p>
                <p className="text-sm text-gray-400">{asset.name}</p>
              </div>
              <div className="text-right">
                <p className="text-white">${asset.value}</p>
                <p
                  className={`text-sm ${
                    asset.isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {asset.isPositive ? "+" : "-"}$
                  {Math.abs(parseFloat(asset.change)).toLocaleString()} (
                  {asset.changePercent}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          {data?.timestamp
            ? `As of: ${data.timestamp}`
            : "No timestamp available"}
        </p>
      </div>
    </div>
  );
};
