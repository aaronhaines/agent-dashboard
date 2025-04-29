import React from "react";
import { ModuleInstance } from "../dashboardStore";
import { useVisualizationData } from "./useVisualizationData";

export interface FinancialMetric {
  current: number;
  previous: number;
  change: number;
}

export interface FinancialData {
  companyName: string;
  lastUpdated: string;
  incomeStatement: {
    revenue: FinancialMetric;
    operatingIncome: FinancialMetric;
    netIncome: FinancialMetric;
  };
  balanceSheet: {
    totalAssets: FinancialMetric;
    totalLiabilities: FinancialMetric;
    equity: FinancialMetric;
  };
  cashFlow: {
    operatingCashFlow: FinancialMetric;
    freeCashFlow: FinancialMetric;
  };
  ratios: {
    currentRatio: FinancialMetric;
    quickRatio: FinancialMetric;
    debtToEquity: FinancialMetric;
    returnOnEquity: FinancialMetric;
    profitMargin: FinancialMetric;
  };
}

interface Props {
  module: ModuleInstance;
}

interface FinancialSnapshotConfig extends ModuleInstance {
  config: {
    companyName: string;
    [key: string]: any;
  };
}

// Mock data loading function - replace with actual API call
async function loadFinancialData(
  module: ModuleInstance
): Promise<FinancialData> {
  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Ensure we get the company name from the module configuration
  const companyName = (module.config.companyName as string) || "Sample Corp";

  return {
    companyName: companyName,
    lastUpdated: new Date().toISOString(),
    incomeStatement: {
      revenue: { current: 1200000, previous: 1000000, change: 20 },
      operatingIncome: { current: 300000, previous: 250000, change: 20 },
      netIncome: { current: 200000, previous: 180000, change: 11.11 },
    },
    balanceSheet: {
      totalAssets: { current: 2500000, previous: 2000000, change: 25 },
      totalLiabilities: { current: 1500000, previous: 1200000, change: 25 },
      equity: { current: 1000000, previous: 800000, change: 25 },
    },
    cashFlow: {
      operatingCashFlow: { current: 350000, previous: 300000, change: 16.67 },
      freeCashFlow: { current: 250000, previous: 200000, change: 25 },
    },
    ratios: {
      currentRatio: { current: 1.8, previous: 1.6, change: 12.5 },
      quickRatio: { current: 1.2, previous: 1.1, change: 9.09 },
      debtToEquity: { current: 1.5, previous: 1.6, change: -6.25 },
      returnOnEquity: { current: 0.2, previous: 0.18, change: 11.11 },
      profitMargin: { current: 0.167, previous: 0.15, change: 11.33 },
    },
  };
}

const MetricCard: React.FC<{
  label: string;
  metric: FinancialMetric;
  format?: "currency" | "percentage" | "ratio";
}> = ({ label, metric, format = "currency" }) => {
  const formatValue = (value: number) => {
    if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    } else if (format === "percentage") {
      return `${value.toFixed(1)}%`;
    } else {
      return value.toFixed(2);
    }
  };

  const changeColor = metric.change >= 0 ? "text-green-300" : "text-red-300";

  return (
    <div className="bg-gray-700 p-3 rounded-lg">
      <div className="text-sm text-gray-300 mb-1">{label}</div>
      <div className="text-lg font-semibold text-white">
        {formatValue(metric.current)}
      </div>
      <div className={`text-sm ${changeColor} flex items-center gap-1`}>
        {metric.change >= 0 ? "↑" : "↓"} {Math.abs(metric.change).toFixed(1)}%
      </div>
    </div>
  );
};

export const FinancialSnapshot: React.FC<Props> = ({ module }) => {
  const { data, isLoading, error } = useVisualizationData<FinancialData>(
    module,
    loadFinancialData
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">Loading financial data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-red-400">Error loading financial data</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-300">
          {data.companyName} Financial Snapshot
        </h2>
        <span className="text-sm text-gray-400">
          Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-4">
        {/* Income Statement */}
        <div>
          <h3 className="text-md font-medium text-gray-300 mb-2">
            Income Statement
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Revenue" metric={data.incomeStatement.revenue} />
            <MetricCard
              label="Operating Income"
              metric={data.incomeStatement.operatingIncome}
            />
            <MetricCard
              label="Net Income"
              metric={data.incomeStatement.netIncome}
            />
          </div>
        </div>

        {/* Balance Sheet */}
        <div>
          <h3 className="text-md font-medium text-gray-300 mb-2">
            Balance Sheet
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="Total Assets"
              metric={data.balanceSheet.totalAssets}
            />
            <MetricCard
              label="Total Liabilities"
              metric={data.balanceSheet.totalLiabilities}
            />
            <MetricCard label="Equity" metric={data.balanceSheet.equity} />
          </div>
        </div>

        {/* Cash Flow */}
        <div>
          <h3 className="text-md font-medium text-gray-300 mb-2">Cash Flow</h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Operating Cash Flow"
              metric={data.cashFlow.operatingCashFlow}
            />
            <MetricCard
              label="Free Cash Flow"
              metric={data.cashFlow.freeCashFlow}
            />
          </div>
        </div>

        {/* Key Ratios */}
        <div>
          <h3 className="text-md font-medium text-gray-300 mb-2">Key Ratios</h3>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="Current Ratio"
              metric={data.ratios.currentRatio}
              format="ratio"
            />
            <MetricCard
              label="Quick Ratio"
              metric={data.ratios.quickRatio}
              format="ratio"
            />
            <MetricCard
              label="Debt to Equity"
              metric={data.ratios.debtToEquity}
              format="ratio"
            />
            <MetricCard
              label="Return on Equity"
              metric={data.ratios.returnOnEquity}
              format="percentage"
            />
            <MetricCard
              label="Profit Margin"
              metric={data.ratios.profitMargin}
              format="percentage"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
