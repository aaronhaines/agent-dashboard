import {
  PortfolioSummary,
  type PortfolioSummaryData,
} from "./PortfolioSummary";
import {
  ExpensesTable,
  type ExpensesTableData,
  type ExpenseItem,
} from "./ExpensesTable";
import { NetWorthSummary, type NetWorthSummaryData } from "./NetWorthSummary";
import { StockPriceChart, type StockPriceData } from "./StockPriceChart";

// Schema definitions for each visualization type
export const visualizationSchemas = {
  portfolioChart: {
    name: "portfolioChart",
    description: "Displays a portfolio value chart",
    component: PortfolioSummary,
    schema: {
      type: "object",
      properties: {
        timeframe: {
          type: "string",
          enum: ["1M", "3M", "1Y", "All"],
          description: "Time period to display",
        },
        showReturns: {
          type: "boolean",
          description: "Whether to show return values",
        },
      },
    },
  },
  expensesTable: {
    name: "expensesTable",
    description: "Displays a table of expenses",
    component: ExpensesTable,
    schema: {
      type: "object",
      properties: {
        categories: {
          type: "array",
          items: { type: "string" },
          description: "List of expense categories to include",
        },
      },
    },
  },
  netWorthSummary: {
    name: "netWorthSummary",
    description: "Shows a summary of net worth",
    component: NetWorthSummary,
    schema: {
      type: "object",
      properties: {
        currency: {
          type: "string",
          description: "Currency to display values in",
        },
      },
    },
  },
  stockPriceChart: {
    name: "stockPriceChart",
    description: "Displays historical stock prices for multiple tickers",
    component: StockPriceChart,
    schema: {
      type: "object",
      properties: {
        tickers: {
          type: "array",
          items: { type: "string" },
          description: "List of stock tickers to display",
        },
        timeRange: {
          type: "string",
          enum: ["1W", "1M", "3M", "6M", "1Y"],
          description: "Time range to display",
        },
      },
    },
  },
} as const;

// Map of module types to their React components (for backward compatibility)
export const visualizationComponents = {
  portfolioChart: PortfolioSummary,
  expensesTable: ExpensesTable,
  netWorthSummary: NetWorthSummary,
  stockPriceChart: StockPriceChart,
} as const;

// Type for all possible module data
export type ModuleData =
  | PortfolioSummaryData
  | ExpensesTableData
  | NetWorthSummaryData
  | StockPriceData;

// Type for all possible module types
export type ModuleType = keyof typeof visualizationComponents;

// Export types for external use
export type {
  PortfolioSummaryData,
  ExpensesTableData,
  ExpenseItem,
  NetWorthSummaryData,
  StockPriceData,
};
