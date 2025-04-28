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
    <div
      className="w-full h-full grid gap-4 p-4 auto-rows-min"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 400px), 1fr))",
        alignContent: "start",
      }}
    >
      {modules.map((mod) => (
        <ModuleCard key={mod.id} module={mod} />
      ))}
    </div>
  );
}
