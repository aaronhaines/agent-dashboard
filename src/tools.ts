import { useDashboardStore } from "./dashboardStore";
import { defineTool } from "./ToolUtils";
import { z } from "zod";

export const Tools = {
  addModule: defineTool(
    "addModule",
    "Add a new dashboard module",
    z.object({
      moduleType: z.string(),
      config: z.record(z.any()),
    }),
    async (module: { moduleType: string; config: any }) => {
      console.log(module.moduleType);
      useDashboardStore.getState().addModule(module.moduleType, module.config);
    }
  ),
  removeModule: defineTool(
    "removeModule",
    "Remove a module by ID",
    z.object({
      moduleId: z.string(),
    }),
    async ({ moduleId }: { moduleId: string }) => {
      useDashboardStore.getState().removeModule(moduleId);
    }
  ),
  updateModuleConfig: defineTool(
    "updateModuleConfig",
    "Update the configuration of an existing module",
    z.object({
      moduleId: z.string(),
      newConfig: z.record(z.any()),
    }),
    async ({ moduleId, newConfig }: { moduleId: string; newConfig: any }) => {
      useDashboardStore.getState().updateModuleConfig(moduleId, newConfig);
    }
  ),
};
