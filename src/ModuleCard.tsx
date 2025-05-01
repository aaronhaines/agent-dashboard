import { ModuleInstance, useDashboardStore } from "./dashboardStore";
import { visualizationComponents } from "./visualizations";
import { ResizableBox } from "react-resizable";
import { useEventStore } from "./eventStore";
import "react-resizable/css/styles.css";

interface Props {
  module: ModuleInstance;
}

const MIN_MODULE_WIDTH = 400;
const MIN_MODULE_HEIGHT = 300;
const DEFAULT_MODULE_WIDTH = 600;
const DEFAULT_MODULE_HEIGHT = 450;

export function ModuleCard({ module }: Props) {
  const removeModule = useDashboardStore((state) => state.removeModule);
  const selectModule = useDashboardStore((state) => state.selectModule);
  const selectedModuleId = useDashboardStore((state) => state.selectedModuleId);
  const addEvent = useEventStore((state) => state.addEvent);
  const isSelected = selectedModuleId === module.id;

  const handleModuleSelect = () => {
    if (!isSelected) {
      selectModule(module.id);
      addEvent({
        type: "moduleSelect",
        moduleId: module.id,
        moduleType: module.moduleType,
        selectedData: module.selectedData,
      });
    } else {
      selectModule(null);
    }
  };

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
    <ResizableBox
      width={DEFAULT_MODULE_WIDTH}
      height={DEFAULT_MODULE_HEIGHT}
      minConstraints={[MIN_MODULE_WIDTH, MIN_MODULE_HEIGHT]}
      maxConstraints={[1200, 800]}
      resizeHandles={["se"]}
      className="relative"
    >
      <div
        className={`absolute inset-0 bg-gray-800 rounded-lg shadow-md flex flex-col cursor-pointer transition-all duration-200 ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={handleModuleSelect}
      >
        <div className="flex-none p-2 flex justify-end">
          <button
            className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-700 text-gray-400 hover:bg-red-500 hover:text-white transition-colors duration-200 text-sm"
            aria-label="Remove module"
            onClick={(e) => {
              e.stopPropagation();
              removeModule(module.id);
            }}
          >
            ×
          </button>
        </div>
        <div className="flex-1 p-4 pt-0 min-h-0 overflow-auto">
          <VisualizationComponent module={module} />
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" />
    </ResizableBox>
  );
}
