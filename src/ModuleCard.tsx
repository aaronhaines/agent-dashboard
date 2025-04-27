import { ModuleInstance, useDashboardStore } from "./dashboardStore";
import { useEffect } from "react";

interface Props {
  module: ModuleInstance;
}

interface PortfolioSummaryData {
  totalValue?: string;
  dailyChange?: string;
  timestamp?: string;
}

// Styled Portfolio Summary Widget (dynamic)
const PortfolioSummary = (data: PortfolioSummaryData) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col justify-between">
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-2">
        Portfolio Overview
      </h2>
      <p className="text-3xl font-bold text-white">
        {data?.totalValue ? `$${data.totalValue}` : "$5,250,430.80"}
      </p>
      <p className="text-sm text-green-400 mt-1">
        {data?.dailyChange ? data.dailyChange : "+1.25% (+ $64,820.15) Today"}
      </p>
    </div>
    <div className="mt-4">
      <p className="text-sm text-gray-400">
        {data?.timestamp
          ? `As of: ${data.timestamp}`
          : "As of: 27 Apr 2025, 1:30 PM BST"}
      </p>
    </div>
  </div>
);

interface ExpenseItem {
  category: string;
  amount: number;
}

async function fakeLoadData(module: ModuleInstance) {
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (module.moduleType) {
        case "portfolioChart":
          resolve({
            totalValue: "5,250,430.80",
            dailyChange: "+1.25% (+ $64,820.15) Today",
            timestamp: "27 Apr 2025, 1:30 PM BST",
            returns: [1, 2, 3],
            config: module.config,
          });
          break;
        case "expensesTable":
          resolve({
            items: [
              { category: "Food", amount: 300 },
              { category: "Travel", amount: 500 },
            ],
          });
          break;
        case "netWorthSummary":
          resolve({ netWorth: 150000 });
          break;
        default:
          resolve({ data: `No data for type: ${module.moduleType}` });
      }
    }, 500);
  });
}

export function ModuleCard({ module }: Props) {
  const setModuleData = useDashboardStore((state) => state.setModuleData);
  const removeModule = useDashboardStore((state) => state.removeModule);

  useEffect(() => {
    fakeLoadData(module).then((data) => {
      setModuleData(module.id, data);
    });
  }, [module.config]);

  if (module.status === "loading") {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center min-h-[120px]">
        Loading {module.moduleType}...
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col justify-between min-h-[200px] relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg font-bold focus:outline-none"
        aria-label="Remove"
        onClick={() => removeModule(module.id)}
      >
        ×
      </button>
      <div>{renderModuleContent(module)}</div>
    </div>
  );
}

function renderModuleContent(module: ModuleInstance) {
  switch (module.moduleType) {
    case "portfolioChart":
      return PortfolioSummary(module.data as PortfolioSummaryData);
    case "expensesTable":
      return (
        <div>
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Expenses</h2>
          <table className="min-w-full text-sm text-gray-300">
            <thead>
              <tr>
                <th className="text-left py-1">Category</th>
                <th className="text-left py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(module.data?.items as ExpenseItem[] | undefined)?.map(
                (item, idx) => (
                  <tr key={idx} className="border-t border-gray-700">
                    <td className="py-1">{item.category}</td>
                    <td className="py-1">${item.amount}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );
    case "netWorthSummary":
      return (
        <div>
          <h2 className="text-lg font-semibold text-gray-300 mb-2">
            Net Worth
          </h2>
          <div className="text-2xl font-bold text-white mb-1">
            ${module.data?.netWorth}
          </div>
        </div>
      );
    default:
      return (
        <pre className="text-xs text-gray-400">
          {JSON.stringify(module.data, null, 2)}
        </pre>
      );
  }
}
