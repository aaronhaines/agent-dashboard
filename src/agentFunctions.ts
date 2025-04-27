import { useDashboardStore } from "./dashboardStore";

// Functions available to the agent
export const agentFunctions = {
  addModule: async (module: { moduleType: string; config: any }) => {
    console.log(module.moduleType);
    useDashboardStore.getState().addModule(module.moduleType, module.config);
  },
  removeModule: async ({ moduleId }: { moduleId: string }) => {
    useDashboardStore.getState().removeModule(moduleId);
  },
  updateModuleConfig: async ({
    moduleId,
    newConfig,
  }: {
    moduleId: string;
    newConfig: any;
  }) => {
    useDashboardStore.getState().updateModuleConfig(moduleId, newConfig);
  },
};

export const availableTools = [
  {
    type: "function",
    function: {
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
  },
  {
    type: "function",
    function: {
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
  },
  {
    type: "function",
    function: {
      name: "updateModuleConfig",
      description: "Update the configuration of an existing module",
      parameters: {
        type: "object",
        properties: {
          moduleId: { type: "string" },
          newConfig: { type: "object" },
        },
        required: ["moduleId", "newConfig"],
      },
    },
  },
];

export const availableFunctions = [
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
  {
    name: "updateModuleConfig",
    description: "Update the configuration of an existing module",
    parameters: {
      type: "object",
      properties: {
        moduleId: { type: "string" },
        newConfig: { type: "object" },
      },
      required: ["moduleId", "newConfig"],
    },
  },
];

export async function processAgentFunctionCall(name: string, args: any) {
  if (agentFunctions[name]) {
    await agentFunctions[name](args);
  } else {
    console.error(`Unknown agent function: ${name}`);
  }
}
