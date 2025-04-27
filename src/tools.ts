import { defineTool } from "./ToolUtils";

export const Tools = {
  addModule: defineTool<{ moduleType: string; config: object }>(
    {
      name: "addModule",
      description: "Add a new module",
      parameters: {
        type: "object",
        properties: {
          moduleType: { type: "string" },
          config: { type: "object" },
        },
        required: ["moduleType", "config"],
      },
    },
    async (args) => {
      // args is now strongly typed as { moduleType: string; config: object }
      console.log("Adding module:", args.moduleType, args.config);
      return { status: "success", moduleId: "new-" + Date.now() };
    }
  ),

  removeModule: defineTool<{ moduleId: string }>(
    {
      name: "removeModule",
      description: "Remove a module",
      parameters: {
        type: "object",
        properties: {
          moduleId: { type: "string" },
        },
        required: ["moduleId"],
      },
    },
    async (args) => {
      console.log("Removing module:", args.moduleId);
      return { status: "success" };
    }
  ),

  updateModuleConfig: defineTool<{ moduleId: string; newConfig: object }>(
    {
      name: "updateModuleConfig",
      description: "Update module configuration",
      parameters: {
        type: "object",
        properties: {
          moduleId: { type: "string" },
          newConfig: { type: "object" },
        },
        required: ["moduleId", "newConfig"],
      },
    },
    async (args) => {
      console.log("Updating module:", args.moduleId, args.newConfig);
      return { status: "success" };
    }
  ),
};
