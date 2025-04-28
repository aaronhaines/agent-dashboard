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
  // Get tracked assets from config or use defaults
  const trackedAssets = (module.config?.trackedAssets as {
    symbol: string;
    name: string;
  }[]) || [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
  ];

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate mock data for each tracked asset
      const assets = trackedAssets.map((asset) => ({
        ...asset,
        value: (Math.random() * 1000000 + 500000).toFixed(2),
        change: (Math.random() * 20000 - 10000).toFixed(2),
        changePercent: (Math.random() * 2 - 1).toFixed(2),
        isPositive: Math.random() > 0.5,
      }));

      // Calculate total value and daily change
      const totalValue = assets
        .reduce((sum, asset) => sum + parseFloat(asset.value), 0)
        .toFixed(2);
      const totalChange = assets
        .reduce((sum, asset) => sum + parseFloat(asset.change), 0)
        .toFixed(2);
      const totalChangePercent = (
        (parseFloat(totalChange) / parseFloat(totalValue)) *
        100
      ).toFixed(2);
      const isPositiveTotal = parseFloat(totalChange) > 0;

      resolve({
        totalValue: totalValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        dailyChange: `${isPositiveTotal ? "+" : "-"}${Math.abs(
          parseFloat(totalChangePercent)
        )}% (${isPositiveTotal ? "+" : "-"} $${Math.abs(
          parseFloat(totalChange)
        ).toLocaleString()}) Today`,
        timestamp: new Date().toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZoneName: "short",
        }),
        assets: assets.map((asset) => ({
          ...asset,
          value: asset.value.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        })),
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
