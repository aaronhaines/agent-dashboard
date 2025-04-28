import { useState, useEffect } from "react";
import { ModuleInstance } from "../dashboardStore";

export interface LoadingState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useVisualizationData<T>(
  module: ModuleInstance,
  loadData: (module: ModuleInstance) => Promise<T>
): LoadingState<T> {
  const [state, setState] = useState<LoadingState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    setState((prev) => ({ ...prev, isLoading: true }));
    loadData(module)
      .then((data) => {
        if (mounted) {
          setState({ data, isLoading: false, error: null });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ data: null, isLoading: false, error });
        }
      });

    return () => {
      mounted = false;
    };
  }, [module.config]);

  return state;
}
