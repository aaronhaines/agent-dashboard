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
      <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-center min-h-[240px]">
        <p className="text-red-400">Unknown module type: {module.moduleType}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md flex flex-col min-h-[240px]">
      <div className="flex-none p-2 flex justify-end">
        <button
          className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 hover:bg-red-500 hover:text-white transition-colors duration-200 text-sm"
          aria-label="Remove module"
          onClick={() => removeModule(module.id)}
        >
          ×
        </button>
      </div>
      <div className="flex-1 p-4 pt-0 min-h-0 overflow-auto">
        <VisualizationComponent module={module} />
      </div>
    </div>
  );
}
