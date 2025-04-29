import { useDashboardStore } from "./dashboardStore";
import { ModuleCard } from "./ModuleCard";

export function Dashboard() {
  const modules = useDashboardStore((state) => state.modules);

  if (modules.length === 0) {
    return (
      <div className="dashboard-content w-full h-full flex items-center justify-center text-gray-400">
        <p>No modules yet. Try asking the agent to add one!</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content w-full h-full p-4 flex flex-wrap gap-4 content-start">
      {modules.map((mod) => (
        <ModuleCard key={mod.id} module={mod} />
      ))}
    </div>
  );
}
