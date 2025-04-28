import { useDashboardStore } from "./dashboardStore";
import { defineTool } from "./ToolUtils";
import { visualizationSchemas } from "./visualizations";

// Extract config type from visualization schemas
type ModuleConfig = {
  [K in keyof typeof visualizationSchemas]: {
    type: "object";
    properties: (typeof visualizationSchemas)[K]["schema"]["properties"];
  };
}[keyof typeof visualizationSchemas];

// Type for module configuration values
type ConfigValue =
  | string
  | number
  | boolean
  | string[]
  | { symbol: string; name: string }[];

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
};
