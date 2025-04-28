import { ModuleInstance, useDashboardStore } from "./dashboardStore";
import { visualizationComponents } from "./visualizations";

interface Props {
  module: ModuleInstance;
}

export function ModuleCard({ module }: Props) {
  const removeModule = useDashboardStore((state) => state.removeModule);

  const VisualizationComponent =
    visualizationComponents[
      module.moduleType as keyof typeof visualizationComponents
    ];
  if (!VisualizationComponent) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center min-h-[120px]">
        Unknown module type: {module.moduleType}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col justify-between min-h-[200px] relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg font-bold focus:outline-none"
        aria-label="Remove"
        onClick={() => removeModule(module.id)}
      >
        ×
      </button>
      <VisualizationComponent module={module} />
    </div>
  );
}
