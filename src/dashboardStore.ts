import { create } from "zustand";

export interface ModuleInstance {
  id: string;
  moduleType: string;
  config: Record<string, any>;
  status?: "loading" | "ready" | "error";
  data?: any;
}

interface DashboardState {
  modules: ModuleInstance[];
  addModule: (moduleType: string, config: Record<string, any>) => void;
  removeModule: (id: string) => void;
  updateModuleConfig: (id: string, newConfig: Record<string, any>) => void;
  setModuleData: (id: string, data: any) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  modules: [],
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
}));

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
