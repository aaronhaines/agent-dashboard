import React from "react";
import { ModuleInstance } from "../dashboardStore";
import { useVisualizationData } from "./useVisualizationData";

export interface CompetitorMetric {
  value: number;
  change: number;
  rank: number;
  total: number;
}

export interface CompetitorData {
  name: string;
  marketCap: CompetitorMetric;
  revenue: CompetitorMetric;
  profitMargin: CompetitorMetric;
  peRatio: CompetitorMetric;
  revenueGrowth: CompetitorMetric;
}

export interface SectorBenchmark {
  metric: string;
  value: number;
  percentile: number;
  average: number;
  median: number;
}

export interface SwotItem {
  category: "strength" | "weakness" | "opportunity" | "threat";
  title: string;
  description: string;
}

export interface MarketAnalysisData {
  companyName: string;
  sector: string;
  lastUpdated: string;
  sectorBenchmarks: SectorBenchmark[];
  competitors: CompetitorData[];
  swotAnalysis: SwotItem[];
}

interface Props {
  module: ModuleInstance;
}

// Mock data loading function - replace with actual API call
async function loadMarketAnalysisData(
  module: ModuleInstance
): Promise<MarketAnalysisData> {
  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const companyName = (module.config.companyName as string) || "Sample Corp";
  const sector = (module.config.sector as string) || "Technology";

  return {
    companyName,
    sector,
    lastUpdated: new Date().toISOString(),
    sectorBenchmarks: [
      {
        metric: "Operating Margin",
        value: 25.5,
        percentile: 75,
        average: 20.1,
        median: 19.8,
      },
      {
        metric: "R&D Investment",
        value: 15.2,
        percentile: 85,
        average: 12.4,
        median: 11.9,
      },
      {
        metric: "Revenue Growth",
        value: 18.5,
        percentile: 65,
        average: 15.7,
        median: 14.9,
      },
    ],
    competitors: [
      {
        name: "Competitor A",
        marketCap: { value: 2500000000, change: 5.2, rank: 2, total: 10 },
        revenue: { value: 500000000, change: 8.1, rank: 3, total: 10 },
        profitMargin: { value: 22.5, change: 1.5, rank: 4, total: 10 },
        peRatio: { value: 25.4, change: -2.1, rank: 5, total: 10 },
        revenueGrowth: { value: 15.2, change: 2.3, rank: 3, total: 10 },
      },
      {
        name: "Competitor B",
        marketCap: { value: 1800000000, change: -2.1, rank: 4, total: 10 },
        revenue: { value: 420000000, change: 5.4, rank: 5, total: 10 },
        profitMargin: { value: 18.9, change: -0.8, rank: 6, total: 10 },
        peRatio: { value: 22.1, change: 1.2, rank: 4, total: 10 },
        revenueGrowth: { value: 12.8, change: -1.5, rank: 6, total: 10 },
      },
    ],
    swotAnalysis: [
      {
        category: "strength",
        title: "Strong Market Position",
        description: "Leading market share in key product segments",
      },
      {
        category: "weakness",
        title: "Cost Structure",
        description: "Higher operational costs compared to peers",
      },
      {
        category: "opportunity",
        title: "Emerging Markets",
        description: "Untapped potential in developing regions",
      },
      {
        category: "threat",
        title: "Competitive Pressure",
        description: "Increasing competition in core markets",
      },
    ],
  };
}

const MetricCard: React.FC<{
  label: string;
  value: number;
  change: number;
  rank: number;
  total: number;
  format?: "currency" | "percentage" | "ratio";
}> = ({ label, value, change, rank, total, format = "currency" }) => {
  const formatValue = (val: number) => {
    if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(val);
    } else if (format === "percentage") {
      return `${val.toFixed(1)}%`;
    } else {
      return val.toFixed(2);
    }
  };

  const changeColor = change >= 0 ? "text-green-300" : "text-red-300";
  const rankText = `Rank: ${rank}/${total}`;

  return (
    <div className="bg-gray-700 p-3 rounded-lg">
      <div className="text-sm text-gray-300 mb-1">{label}</div>
      <div className="text-lg font-semibold text-white">
        {formatValue(value)}
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className={`text-sm ${changeColor}`}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
        </div>
        <div className="text-sm text-gray-400">{rankText}</div>
      </div>
    </div>
  );
};

const BenchmarkBar: React.FC<{ benchmark: SectorBenchmark }> = ({
  benchmark,
}) => {
  return (
    <div className="bg-gray-700 p-3 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-300">{benchmark.metric}</div>
        <div className="text-sm text-gray-400">
          {benchmark.percentile}th percentile
        </div>
      </div>
      <div className="relative h-2 bg-gray-600 rounded-full">
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${benchmark.percentile}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <div className="text-gray-400">
          Avg: {benchmark.average.toFixed(1)}%
        </div>
        <div className="text-white font-semibold">
          {benchmark.value.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

const SwotGrid: React.FC<{ items: SwotItem[] }> = ({ items }) => {
  const getColorClass = (category: SwotItem["category"]) => {
    switch (category) {
      case "strength":
        return "bg-green-900/50";
      case "weakness":
        return "bg-red-900/50";
      case "opportunity":
        return "bg-blue-900/50";
      case "threat":
        return "bg-orange-900/50";
      default:
        return "bg-gray-700";
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${getColorClass(item.category)}`}
        >
          <div className="text-sm font-medium text-gray-300 capitalize mb-1">
            {item.category}
          </div>
          <div className="text-white font-semibold mb-1">{item.title}</div>
          <div className="text-sm text-gray-300">{item.description}</div>
        </div>
      ))}
    </div>
  );
};

export const MarketAnalysis: React.FC<Props> = ({ module }) => {
  const { data, isLoading, error } = useVisualizationData<MarketAnalysisData>(
    module,
    loadMarketAnalysisData
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">Loading market analysis data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-red-400">Error loading market analysis data</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-300">
            {data.companyName} Market Analysis
          </h2>
          <div className="text-sm text-gray-400">
            Sector: {data.sector} | Last updated:{" "}
            {new Date(data.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sector Benchmarks */}
        <div>
          <h3 className="text-md font-medium text-gray-300 mb-3">
            Sector Benchmarks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.sectorBenchmarks.map((benchmark, index) => (
              <BenchmarkBar key={index} benchmark={benchmark} />
            ))}
          </div>
        </div>

        {/* Competitor Analysis */}
        <div>
          <h3 className="text-md font-medium text-gray-300 mb-3">
            Competitor Analysis
          </h3>
          {data.competitors.map((competitor, index) => (
            <div key={index} className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                {competitor.name}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <MetricCard
                  label="Market Cap"
                  {...competitor.marketCap}
                  format="currency"
                />
                <MetricCard
                  label="Revenue"
                  {...competitor.revenue}
                  format="currency"
                />
                <MetricCard
                  label="Profit Margin"
                  {...competitor.profitMargin}
                  format="percentage"
                />
                <MetricCard
                  label="P/E Ratio"
                  {...competitor.peRatio}
                  format="ratio"
                />
                <MetricCard
                  label="Revenue Growth"
                  {...competitor.revenueGrowth}
                  format="percentage"
                />
              </div>
            </div>
          ))}
        </div>

        {/* SWOT Analysis */}
        <div>
          <h3 className="text-md font-medium text-gray-300 mb-3">
            SWOT Analysis
          </h3>
          <SwotGrid items={data.swotAnalysis} />
        </div>
      </div>
    </div>
  );
};
