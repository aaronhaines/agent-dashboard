export async function mockAgentCall(
  userPrompt: string,
  dashboardSnapshot: any
) {
  console.log("User Prompt:", userPrompt);
  console.log("Dashboard Snapshot:", dashboardSnapshot);

  // Simple logic to simulate agent behavior
  if (userPrompt.includes("add") && userPrompt.includes("chart")) {
    return {
      function_call: {
        name: "addModule",
        arguments: {
          moduleType: "portfolioChart",
          config: {
            accounts: ["retirement", "savings"],
            timeRange: "last_year",
          },
        },
      },
    };
  } else if (userPrompt.includes("remove")) {
    if (dashboardSnapshot.length > 0) {
      return {
        function_call: {
          name: "removeModule",
          arguments: { moduleId: dashboardSnapshot[0].id },
        },
      };
    }
  } else if (userPrompt.includes("update")) {
    if (dashboardSnapshot.length > 0) {
      return {
        function_call: {
          name: "updateModuleConfig",
          arguments: {
            moduleId: dashboardSnapshot[0].id,
            newConfig: { timeRange: "last_6_months" },
          },
        },
      };
    }
  }

  // fallback
  return null;
}
