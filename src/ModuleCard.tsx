import { ModuleInstance, useDashboardStore } from "./dashboardStore";
import { useEffect } from "react";

interface Props {
  module: ModuleInstance;
}

const PortfolioSummary = (data) => (
  // Container for the portfolio summary widget
  <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col justify-between">
    <div>
      {/* Widget Title */}
      <h2 className="text-lg font-semibold text-gray-300 mb-2">
        Portfolio Overview
      </h2>
      {/* Total Portfolio Value */}
      <p className="text-3xl font-bold text-white">$5,250,430.80</p>
      {/* Daily Change */}
      <p className="text-sm text-green-400 mt-1">+1.25% (+ $64,820.15) Today</p>
    </div>
    {/* Timestamp */}
    <div className="mt-4">
      <p className="text-sm text-gray-400">As of: 27 Apr 2025, 1:30 PM BST</p>
    </div>
  </div>
);

async function fakeLoadData(module: ModuleInstance) {
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (module.moduleType) {
        case "portfolioChart":
          resolve({ returns: [1, 2, 3], config: module.config });
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
    return <div style={cardStyle}>Loading {module.moduleType}...</div>;
  }

  return (
    <div style={cardStyle}>
      <div>{renderModuleContent(module)}</div>
      <button
        className="text-sm font-bold text-white"
        onClick={() => removeModule(module.id)}
      >
        Remove
      </button>
    </div>
  );
}

function renderModuleContent(module: ModuleInstance) {
  switch (module.moduleType) {
    case "portfolioChart":
      //return <pre>{JSON.stringify(module.data, null, 2)}</pre>;
      return PortfolioSummary(module.data);
    case "expensesTable":
      return (
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {module.data?.items?.map((item: any, idx: number) => (
              <tr key={idx}>
                <td>{item.category}</td>
                <td>${item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "netWorthSummary":
      return (
        <div>
          <strong>Net Worth:</strong> ${module.data?.netWorth}
        </div>
      );
    default:
      return <pre>{JSON.stringify(module.data, null, 2)}</pre>;
  }
}

const cardStyle = { padding: 20, border: "1px solid gray", width: 300 };
