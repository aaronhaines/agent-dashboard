import { create } from "zustand";
import { persist } from "zustand/middleware";

// Module-specific selection types
export type ModuleSelectionType = {
  marketMovers: MarketMover;
  // Add other module selection types as needed
  // stockChart: { timestamp: string; price: number };
  // portfolioSummary: { assetId: string; holdings: number };
};

// Import the MarketMover type for proper typing
interface MarketMover {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  volume: string;
}

export interface ModuleInstance<
  T extends keyof ModuleSelectionType = keyof ModuleSelectionType
> {
  id: string;
  moduleType: T;
  config: Record<string, unknown>;
  status?: "loading" | "ready" | "error";
  data?: unknown;
  selectedData?: ModuleSelectionType[T] | null;
  setData?: (data: unknown) => void;
  setSelectedData?: (data: ModuleSelectionType[T] | null) => void;
}

interface DashboardState {
  modules: ModuleInstance[];
  selectedModuleId: string | null;
  addModule: (
    moduleType: keyof ModuleSelectionType,
    config: Record<string, unknown>
  ) => void;
  removeModule: (id: string) => void;
  updateModuleConfig: (id: string, newConfig: Record<string, unknown>) => void;
  setModuleData: (id: string, data: unknown) => void;
  setModuleSelectedData: <T extends keyof ModuleSelectionType>(
    id: string,
    selectedData: ModuleSelectionType[T] | null
  ) => void;
  selectModule: (id: string | null) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      modules: [],
      selectedModuleId: null,
      addModule: (moduleType, config) =>
        set((state) => ({
          modules: [
            {
              id: generateId(),
              moduleType,
              config,
              status: "loading",
              selectedData: null,
            },
            ...state.modules,
          ],
        })),
      removeModule: (id) =>
        set((state) => ({
          modules: state.modules.filter((m) => m.id !== id),
          selectedModuleId:
            state.selectedModuleId === id ? null : state.selectedModuleId,
        })),
      updateModuleConfig: (id, newConfig) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id
              ? {
                  ...m,
                  config: newConfig,
                  status: "loading",
                }
              : m
          ),
        })),
      setModuleData: (id, data) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id
              ? {
                  ...m,
                  data,
                  status: "ready",
                }
              : m
          ),
        })),
      setModuleSelectedData: (id, selectedData) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id
              ? {
                  ...m,
                  selectedData:
                    selectedData as ModuleSelectionType[typeof m.moduleType],
                }
              : m
          ),
        })),
      selectModule: (id) =>
        set(() => ({
          selectedModuleId: id,
        })),
    }),
    {
      name: "dashboard-storage",
      partialize: (state) => {
        const persistedState = {
          modules: state.modules.map(
            ({ id, moduleType, config, selectedData }) => ({
              id,
              moduleType,
              config,
              selectedData: selectedData || null,
            })
          ),
          selectedModuleId: state.selectedModuleId,
        };
        console.log(
          "Dashboard state captured:",
          JSON.stringify(persistedState, null, 2)
        );
        return persistedState;
      },
    }
  )
);

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
