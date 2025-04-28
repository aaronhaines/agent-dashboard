import React from "react";
import { ModuleInstance } from "../dashboardStore";
import { useVisualizationData } from "./useVisualizationData";

export interface ExpenseItem {
  category: string;
  amount: number;
}

export interface ExpensesTableData {
  items?: ExpenseItem[];
}

async function loadExpensesData(
  module: ModuleInstance
): Promise<ExpensesTableData> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const allItems = [
        { category: "Food", amount: 300 },
        { category: "Travel", amount: 500 },
        { category: "Entertainment", amount: 200 },
        { category: "Utilities", amount: 150 },
      ];

      // Filter items based on config.categories if provided
      const categories = module.config?.categories as string[] | undefined;
      const filteredItems = categories?.length
        ? allItems.filter((item) => categories.includes(item.category))
        : allItems;

      resolve({
        items: filteredItems,
      });
    }, 500);
  });
}

interface Props {
  module: ModuleInstance;
}

export const ExpensesTable: React.FC<Props> = ({ module }) => {
  const { data, isLoading, error } = useVisualizationData<ExpensesTableData>(
    module,
    loadExpensesData
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">Loading expenses data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-red-400">Error loading expenses data</p>
      </div>
    );
  }

  const categories = module.config?.categories as string[] | undefined;
  const title = categories?.length
    ? `Expenses (${categories.join(", ")})`
    : "All Expenses";

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-2">{title}</h2>
      <table className="min-w-full text-sm text-gray-300">
        <thead>
          <tr>
            <th className="text-left py-1">Category</th>
            <th className="text-left py-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data?.items?.map((item, idx) => (
            <tr key={idx} className="border-t border-gray-700">
              <td className="py-1">{item.category}</td>
              <td className="py-1">${item.amount}</td>
            </tr>
          ))}
          {(!data?.items || data.items.length === 0) && (
            <tr className="border-t border-gray-700">
              <td colSpan={2} className="py-1 text-center text-gray-400">
                No expenses to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
