import React from "react";
import { ModuleInstance } from "../dashboardStore";
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
  module: ModuleInstance
): Promise<MarketMoversData> {
  // Get config values with defaults
  const numMovers = (module.config?.numMovers as number) || 5;
  const trackedAssets =
    (module.config?.trackedAssets as {
      symbol: string;
      name: string;
      sector?: string;
    }[]) || [];

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
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
        gainers,
        losers,
      });
    }, 500);
  });
}

const MarketMoverRow: React.FC<{ mover: MarketMover; isGainer: boolean }> = ({
  mover,
  isGainer,
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-700">
    <div className="flex-1">
      <p className="text-white font-medium">{mover.symbol}</p>
      <p className="text-sm text-gray-400">{mover.name}</p>
    </div>
    <div className="flex-1 text-right">
      <p className="text-white">${mover.price}</p>
      <p className={`text-sm ${isGainer ? "text-green-400" : "text-red-400"}`}>
        {isGainer ? "+" : ""}
        {mover.change} ({mover.changePercent}%)
      </p>
    </div>
    <div className="flex-1 text-right">
      <p className="text-sm text-gray-400">Vol</p>
      <p className="text-sm text-white">
        {parseInt(mover.volume).toLocaleString()}
      </p>
    </div>
  </div>
);

interface Props {
  module: ModuleInstance;
}

export const MarketMovers: React.FC<Props> = ({ module }) => {
  const { data, isLoading, error } = useVisualizationData<MarketMoversData>(
    module,
    loadMarketMoversData
  );

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
        <p className="text-red-400">Error loading market data</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-300 mb-4">
        Market Movers
      </h2>

      <div className="flex-grow grid grid-cols-2 gap-6">
        {/* Gainers */}
        <div>
          <h3 className="text-green-400 font-medium mb-3">Top Gainers</h3>
          <div className="space-y-1">
            {data?.gainers.map((gainer, index) => (
              <MarketMoverRow key={index} mover={gainer} isGainer={true} />
            ))}
          </div>
        </div>

        {/* Losers */}
        <div>
          <h3 className="text-red-400 font-medium mb-3">Top Losers</h3>
          <div className="space-y-1">
            {data?.losers.map((loser, index) => (
              <MarketMoverRow key={index} mover={loser} isGainer={false} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-700">
        <p className="text-sm text-gray-400">As of: {data?.timestamp}</p>
      </div>
    </div>
  );
};
