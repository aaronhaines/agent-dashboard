import { ModuleInstance, useDashboardStore } from "./dashboardStore";
import { useEffect } from "react";

interface Props {
  module: ModuleInstance;
}

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
      <h3>{renderTitle(module)}</h3>
      <div>{renderModuleContent(module)}</div>
      <button onClick={() => removeModule(module.id)}>Remove</button>
    </div>
  );
}

function renderTitle(module: ModuleInstance) {
  console.log(module);
  switch (module.moduleType) {
    case "portfolioChart":
      return "Portfolio Performance";
    case "expensesTable":
      return "Expenses Table";
    case "netWorthSummary":
      return "Net Worth Summary";
    default:
      return "Unknown Module";
  }
}

function renderModuleContent(module: ModuleInstance) {
  switch (module.moduleType) {
    case "portfolioChart":
      return <pre>{JSON.stringify(module.data, null, 2)}</pre>;
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
