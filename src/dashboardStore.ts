import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ModuleInstance {
  id: string;
  moduleType: string;
  config: Record<string, any>;
  status?: "loading" | "ready" | "error";
  data?: any;
}

interface DashboardState {
  modules: ModuleInstance[];
  selectedModuleId: string | null;
  addModule: (moduleType: string, config: Record<string, any>) => void;
  removeModule: (id: string) => void;
  updateModuleConfig: (id: string, newConfig: Record<string, any>) => void;
  setModuleData: (id: string, data: any) => void;
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
            ...state.modules,
            { id: generateId(), moduleType, config, status: "loading" },
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
            m.id === id ? { ...m, config: newConfig, status: "loading" } : m
          ),
        })),
      setModuleData: (id, data) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, data, status: "ready" } : m
          ),
        })),
      selectModule: (id) =>
        set(() => ({
          selectedModuleId: id,
        })),
    }),
    {
      name: "dashboard-storage",
      partialize: (state) => ({
        modules: state.modules.map(({ id, moduleType, config }) => ({
          id,
          moduleType,
          config,
        })),
        selectedModuleId: state.selectedModuleId,
      }),
    }
  )
);

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
