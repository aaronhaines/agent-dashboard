import { useDashboardStore } from "./dashboardStore";
import { defineTool } from "./ToolUtils";
import { visualizationSchemas } from "./visualizations";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
            description:
              "Optional filename for the PDF (default: dashboard.pdf)",
          },
        },
        required: [],
      },
    },
    async ({ filename = "dashboard.pdf" }) => {
      const dashboard = document.querySelector(
        ".dashboard-content"
      ) as HTMLElement;
      if (!dashboard) {
        throw new Error("Dashboard element not found");
      }

      try {
        // Force color-space to RGB before capture
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
          * {
            color-scheme: dark;
            forced-color-adjust: none;
            color: rgb(var(--text-color, 255 255 255)) !important;
            background-color: rgb(17 24 39) !important;
            border-color: rgb(55 65 81) !important;
          }
          .bg-gray-700 { background-color: rgb(55 65 81) !important; }
          .bg-gray-800 { background-color: rgb(31 41 55) !important; }
          .text-gray-400 { color: rgb(156 163 175) !important; }
          .text-blue-300 { color: rgb(147 197 253) !important; }
          .text-green-300 { color: rgb(134 239 172) !important; }
          .text-purple-300 { color: rgb(216 180 254) !important; }
          .text-yellow-300 { color: rgb(253 224 71) !important; }
          .text-red-300 { color: rgb(252 165 165) !important; }
          .text-orange-300 { color: rgb(253 186 116) !important; }
        `;
        dashboard.appendChild(styleSheet);

        const canvas = await html2canvas(dashboard, {
          scale: 2, // Higher quality
          useCORS: true, // Handle cross-origin images
          logging: false,
          backgroundColor: "#111827", // Match dashboard background
          removeContainer: true, // Clean up temporary elements
        });

        // Remove temporary style sheet
        styleSheet.remove();

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(filename);

        return `Dashboard exported successfully to ${filename}`;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Failed to export dashboard: ${errorMessage}`);
      }
    }
  ),
};
