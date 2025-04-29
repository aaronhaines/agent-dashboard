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
import { MarketMovers, type MarketMoversData } from "./MarketMovers";
import { CompanyNews, type CompanyNewsData } from "./CompanyNews";
import { FinancialSnapshot } from "./FinancialSnapshot";
import { MarketAnalysis, type MarketAnalysisData } from "./MarketAnalysis";

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
        trackedAssets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              symbol: { type: "string" },
              name: { type: "string" },
            },
            required: ["symbol", "name"],
          },
          description: "List of assets to track in the portfolio",
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
  marketMovers: {
    name: "marketMovers",
    description: "Displays biggest market gainers and losers",
    component: MarketMovers,
    schema: {
      type: "object",
      properties: {
        numMovers: {
          type: "number",
          minimum: 1,
          maximum: 10,
          default: 5,
          description: "Number of top gainers/losers to display",
        },
        minVolume: {
          type: "number",
          description: "Minimum trading volume to include (in thousands)",
          default: 100,
        },
        trackedAssets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              symbol: { type: "string" },
              name: { type: "string" },
              sector: { type: "string" },
            },
            required: ["symbol", "name"],
          },
          description: "List of assets to track for market movements",
        },
      },
    },
  },
  companyNews: {
    name: "companyNews",
    description: "Displays news headlines for a specific company",
    component: CompanyNews,
    schema: {
      type: "object",
      properties: {
        company: {
          type: "string",
          description: "Company name to show news for",
        },
        timeRange: {
          type: "string",
          enum: ["1D", "1W", "1M", "3M", "1Y"],
          description: "Time range for news articles",
        },
      },
      required: ["company", "timeRange"],
    },
  },
  financialSnapshot: {
    name: "financialSnapshot",
    description: "Displays a financial snapshot of a company",
    component: FinancialSnapshot,
    schema: {
      type: "object",
      properties: {
        companyName: {
          type: "string",
          description: "Name of the company to display financial data for",
        },
      },
      required: ["companyName"],
    },
  },
  marketAnalysis: {
    name: "marketAnalysis",
    description: "Displays market and competitor analysis",
    component: MarketAnalysis,
    schema: {
      type: "object",
      properties: {
        companyName: {
          type: "string",
          description: "Name of the company to analyze",
        },
        sector: {
          type: "string",
          description: "Industry sector of the company",
        },
        competitors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              symbol: { type: "string" },
            },
            required: ["name", "symbol"],
          },
          description: "List of competitors to analyze",
        },
      },
      required: ["companyName", "sector"],
    },
  },
} as const;

// Map of module types to their React components (for backward compatibility)
export const visualizationComponents = {
  portfolioChart: PortfolioSummary,
  expensesTable: ExpensesTable,
  netWorthSummary: NetWorthSummary,
  stockPriceChart: StockPriceChart,
  marketMovers: MarketMovers,
  companyNews: CompanyNews,
  financialSnapshot: FinancialSnapshot,
  marketAnalysis: MarketAnalysis,
} as const;

// Type for all possible module data
export type ModuleData =
  | PortfolioSummaryData
  | ExpensesTableData
  | NetWorthSummaryData
  | StockPriceData
  | MarketMoversData
  | CompanyNewsData
  | MarketAnalysisData;

// Type for all possible module types
export type ModuleType = keyof typeof visualizationComponents;

// Export types for external use
export type {
  PortfolioSummaryData,
  ExpensesTableData,
  ExpenseItem,
  NetWorthSummaryData,
  StockPriceData,
  MarketMoversData,
  CompanyNewsData,
  MarketAnalysisData,
};
