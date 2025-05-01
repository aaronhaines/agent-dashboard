import React from "react";
import { ModuleInstance, ModuleSelectionType } from "../dashboardStore";
import { useVisualizationData } from "./useVisualizationData";

export interface MarketMover {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  volume: string;
}

export interface MarketMoversData {
  timestamp: string;
  gainers: MarketMover[];
  losers: MarketMover[];
}

async function loadMarketMoversData(
  module: ModuleInstance<"marketMovers">
): Promise<MarketMoversData> {
  // Get config values with defaults
  const numMovers = (module.config?.numMovers as number) || 5;
  const trackedAssets =
    (module.config?.trackedAssets as {
      symbol: string;
      name: string;
      sector?: string;
    }[]) || [];

  // Return early if no tracked assets
  if (!trackedAssets.length) {
    return {
      timestamp: new Date().toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZoneName: "short",
      }),
      gainers: [],
      losers: [],
    };
  }

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Generate mock data for gainers from tracked assets
        const gainers = Array.from(
          { length: Math.min(numMovers, Math.ceil(trackedAssets.length / 2)) },
          () => {
            const asset =
              trackedAssets[Math.floor(Math.random() * trackedAssets.length)];
            const price = (Math.random() * 200 + 50).toFixed(2);
            const changePercent = (Math.random() * 15 + 5).toFixed(2);
            const change = (
              (parseFloat(price) * parseFloat(changePercent)) /
              100
            ).toFixed(2);
            const volume = (Math.random() * 10000000).toFixed(0);

            return {
              symbol: asset.symbol,
              name: asset.name,
              price: price,
              change: change,
              changePercent: changePercent,
              volume: volume,
            };
          }
        );

        // Generate mock data for losers from tracked assets
        const losers = Array.from(
          { length: Math.min(numMovers, Math.ceil(trackedAssets.length / 2)) },
          () => {
            const asset =
              trackedAssets[Math.floor(Math.random() * trackedAssets.length)];
            const price = (Math.random() * 200 + 50).toFixed(2);
            const changePercent = (-Math.random() * 15 - 5).toFixed(2);
            const change = (
              (parseFloat(price) * parseFloat(changePercent)) /
              100
            ).toFixed(2);
            const volume = (Math.random() * 10000000).toFixed(0);

            return {
              symbol: asset.symbol,
              name: asset.name,
              price: price,
              change: change,
              changePercent: changePercent,
              volume: volume,
            };
          }
        );

        const data = {
          timestamp: new Date().toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            timeZoneName: "short",
          }),
          gainers,
          losers,
        };

        resolve(data);
      } catch (error) {
        console.error("Error generating market data:", error);
        // Return empty data on error
        resolve({
          timestamp: new Date().toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            timeZoneName: "short",
          }),
          gainers: [],
          losers: [],
        });
      }
    }, 500);
  });
}

const MarketMoverRow: React.FC<{
  mover: MarketMover;
  isGainer: boolean;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ mover, isGainer, isSelected, onSelect }) => (
  <div
    className={`flex flex-col bg-gray-700 rounded p-2 hover:bg-gray-600 transition-colors cursor-pointer ${
      isSelected ? "ring-2 ring-blue-500" : ""
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center justify-between mb-1">
      <span className="font-medium text-white">{mover.symbol}</span>
      <span
        className={`text-sm ${isGainer ? "text-green-400" : "text-red-400"}`}
      >
        {isGainer ? "+" : ""}
        {mover.changePercent}%
      </span>
    </div>
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">${mover.price}</span>
      <span className={`${isGainer ? "text-green-400" : "text-red-400"}`}>
        {isGainer ? "+" : ""}${Math.abs(parseFloat(mover.change))}
      </span>
    </div>
  </div>
);

interface Props {
  module: ModuleInstance<"marketMovers">;
}

export const MarketMovers: React.FC<Props> = ({ module }) => {
  const { data, isLoading, error, selectedData, setSelectedData } =
    useVisualizationData<MarketMoversData, "marketMovers">(
      module,
      loadMarketMoversData
    );

  const handleMoverSelect = (mover: MarketMover) => {
    setSelectedData(selectedData?.symbol === mover.symbol ? null : mover);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">Loading market data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-red-400">
          Error loading market data: {error.message}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">No market data available</p>
      </div>
    );
  }

  if (!data.gainers.length && !data.losers.length) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">No tracked assets configured</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-300">Market Movers</h2>
        <span className="text-xs text-gray-400">
          Vol {(module.config?.minVolume as number)?.toLocaleString()}k+
        </span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3">
        <div>
          <h3 className="text-sm font-medium text-green-400 mb-2">
            Top Gainers
          </h3>
          <div className="grid gap-2">
            {data.gainers.map((gainer, index) => (
              <MarketMoverRow
                key={index}
                mover={gainer}
                isGainer={true}
                isSelected={selectedData?.symbol === gainer.symbol}
                onSelect={() => handleMoverSelect(gainer)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-red-400 mb-2">Top Losers</h3>
          <div className="grid gap-2">
            {data.losers.map((loser, index) => (
              <MarketMoverRow
                key={index}
                mover={loser}
                isGainer={false}
                isSelected={selectedData?.symbol === loser.symbol}
                onSelect={() => handleMoverSelect(loser)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-700">
        <p className="text-xs text-gray-400">As of: {data.timestamp}</p>
      </div>
    </div>
  );
};
