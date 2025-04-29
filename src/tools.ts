import { useDashboardStore } from "./dashboardStore";
import { defineTool } from "./ToolUtils";
import { visualizationSchemas } from "./visualizations";
import { exportDashboardToPdf } from "./utils/pdfExport";

// Extract config type from visualization schemas
export type ModuleConfig = {
  [key: string]: unknown;
};

// Type for module configuration values
type ConfigValue =
  | string
  | number
  | boolean
  | string[]
  | { symbol: string; name: string; sector?: string }[];

// Default configs for each module type
const defaultConfigs: Record<
  keyof typeof visualizationSchemas,
  Record<string, ConfigValue>
> = {
  portfolioChart: {
    timeframe: "1M",
    showReturns: false,
    trackedAssets: [
      { symbol: "AAPL", name: "Apple Inc." },
      { symbol: "GOOGL", name: "Alphabet Inc." },
      { symbol: "MSFT", name: "Microsoft Corp." },
    ],
  },
  expensesTable: {
    categories: [],
  },
  netWorthSummary: {
    currency: "USD",
  },
  stockPriceChart: {
    tickers: ["AAPL"],
    timeRange: "1M",
  },
  marketMovers: {
    numMovers: 5,
    minVolume: 100,
    trackedAssets: [
      { symbol: "NVDA", name: "NVIDIA Corp", sector: "Technology" },
      { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology" },
      { symbol: "TSLA", name: "Tesla Inc", sector: "Automotive" },
      { symbol: "META", name: "Meta Platforms", sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com", sector: "Consumer" },
      { symbol: "NFLX", name: "Netflix Inc", sector: "Media" },
      { symbol: "AAPL", name: "Apple Inc", sector: "Technology" },
      { symbol: "BAC", name: "Bank of America", sector: "Financial" },
      { symbol: "WFC", name: "Wells Fargo", sector: "Financial" },
      { symbol: "JPM", name: "JPMorgan Chase", sector: "Financial" },
      { symbol: "GS", name: "Goldman Sachs", sector: "Financial" },
      { symbol: "MS", name: "Morgan Stanley", sector: "Financial" },
    ],
  },
  companyNews: {
    company: "Apple",
    timeRange: "1W",
  },
};

export const Tools = {
  addModule: defineTool<{ moduleType: string; config: ModuleConfig }>(
    {
      name: "addModule",
      description: "Add a new dashboard module",
      parameters: {
        type: "object",
        properties: {
          moduleType: { type: "string" },
          config: { type: "object" },
        },
        required: ["moduleType", "config"],
      },
    },
    async (module: { moduleType: string; config: ModuleConfig }) => {
      // Merge provided config with default config
      const defaultConfig =
        defaultConfigs[
          module.moduleType as keyof typeof visualizationSchemas
        ] || {};
      const finalConfig = { ...defaultConfig, ...module.config };

      useDashboardStore.getState().addModule(module.moduleType, finalConfig);
      return `Added module ${module.moduleType} with config ${JSON.stringify(
        finalConfig
      )}`;
    }
  ),
  removeModule: defineTool<{ moduleId: string }>(
    {
      name: "removeModule",
      description: "Remove a module by ID",
      parameters: {
        type: "object",
        properties: {
          moduleId: { type: "string" },
        },
        required: ["moduleId"],
      },
    },
    async ({ moduleId }: { moduleId: string }) => {
      useDashboardStore.getState().removeModule(moduleId);
      return `Removed module ${moduleId} `;
    }
  ),
  updateModuleConfig: defineTool<{ moduleId: string; config: ModuleConfig }>(
    {
      name: "updateModuleConfig",
      description: "Update the configuration of an existing module",
      parameters: {
        type: "object",
        properties: {
          moduleId: { type: "string" },
          config: {
            type: "object",
            description: "The new configuration to apply",
          },
        },
        required: ["moduleId", "config"],
      },
    },
    async ({
      moduleId,
      config,
    }: {
      moduleId: string;
      config: ModuleConfig;
    }) => {
      useDashboardStore.getState().updateModuleConfig(moduleId, config);
      return `Updated module ${moduleId} with new config ${JSON.stringify(
        config
      )}`;
    }
  ),
  exportToPdf: defineTool<{ filename?: string }>(
    {
      name: "exportToPdf",
      description: "Export the current dashboard to a PDF file",
      parameters: {
        type: "object",
        properties: {
          filename: {
            type: "string",
            description: "Optional filename for the exported PDF",
          },
        },
        required: [],
      },
    },
    async ({ filename }) => {
      await exportDashboardToPdf(filename);
      return "Dashboard exported successfully to PDF";
    }
  ),
};
