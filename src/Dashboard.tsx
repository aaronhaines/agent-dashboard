import { useDashboardStore } from "./dashboardStore";
import { ModuleCard } from "./ModuleCard";

export function Dashboard() {
  const modules = useDashboardStore((state) => state.modules);

  if (modules.length === 0) {
    return <p>No modules yet. Try asking the agent to add one!</p>;
  }

  return (
    <div
      className="w-full h-full grid gap-4"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        alignContent: "start",
        height: "100%",
      }}
    >
      {modules.map((mod) => (
        <ModuleCard key={mod.id} module={mod} />
      ))}
    </div>
  );
}
