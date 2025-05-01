import { useState, useEffect, useCallback } from "react";
import { ModuleInstance, ModuleSelectionType } from "../dashboardStore";
import { useDashboardStore } from "../dashboardStore";

export interface LoadingState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface VisualizationState<T, S> extends LoadingState<T> {
  selectedData: S | null;
  setSelectedData: (data: S | null) => void;
}

export function useVisualizationData<T, K extends keyof ModuleSelectionType>(
  module: ModuleInstance<K>,
  loadData: (module: ModuleInstance<K>) => Promise<T>
): VisualizationState<T, ModuleSelectionType[K]> {
  const [state, setState] = useState<LoadingState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const setModuleData = useDashboardStore((state) => state.setModuleData);
  const setModuleSelectedData = useDashboardStore(
    (state) => state.setModuleSelectedData
  );

  const setSelectedData = useCallback(
    (data: ModuleSelectionType[K] | null) => {
      setModuleSelectedData(module.id, data);
    },
    [module.id, setModuleSelectedData]
  );

  useEffect(() => {
    module.setSelectedData = setSelectedData;
    return () => {
      module.setSelectedData = undefined;
    };
  }, [module, setSelectedData]);

  useEffect(() => {
    let mounted = true;

    setState((prev) => ({ ...prev, isLoading: true }));
    loadData(module)
      .then((data) => {
        if (mounted) {
          setState({ data, isLoading: false, error: null });
          setModuleData(module.id, data);
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ data: null, isLoading: false, error });
          console.error("Error loading visualization data:", error);
        }
      });

    return () => {
      mounted = false;
    };
  }, [module.id, module.config, loadData, setModuleData]);

  return {
    ...state,
    selectedData: module.selectedData as ModuleSelectionType[K] | null,
    setSelectedData,
  };
}
