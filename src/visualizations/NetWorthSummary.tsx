import React from "react";
import { ModuleInstance } from "../dashboardStore";
import { useVisualizationData } from "./useVisualizationData";

export interface NetWorthSummaryData {
  netWorth?: number;
}

async function loadNetWorthData(
  _module: ModuleInstance
): Promise<NetWorthSummaryData> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        netWorth: 150000,
      });
    }, 500);
  });
}

interface Props {
  module: ModuleInstance;
}

export const NetWorthSummary: React.FC<Props> = ({ module }) => {
  const { data, isLoading, error } = useVisualizationData<NetWorthSummaryData>(
    module,
    loadNetWorthData
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">Loading net worth data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-red-400">Error loading net worth data</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-2">Net Worth</h2>
      <div className="text-2xl font-bold text-white mb-1">
        ${data?.netWorth?.toLocaleString() ?? "0"}
      </div>
    </div>
  );
};
