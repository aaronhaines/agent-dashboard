import { useDashboardStore } from "./dashboardStore";
import { ModuleCard } from "./ModuleCard";

export function Dashboard() {
  const modules = useDashboardStore((state) => state.modules);

  if (modules.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <p>No modules yet. Try asking the agent to add one!</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4">
      {modules.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}
