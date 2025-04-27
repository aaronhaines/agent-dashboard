import { useDashboardStore } from "./dashboardStore";
import { ModuleCard } from "./ModuleCard";

export function Dashboard() {
  const modules = useDashboardStore((state) => state.modules);

  if (modules.length === 0) {
    return <p>No modules yet. Try asking the agent to add one!</p>;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {modules.map((mod) => (
        <ModuleCard key={mod.id} module={mod} />
      ))}
    </div>
  );
}
