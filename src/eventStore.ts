import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserEvent {
  type: "moduleSelect" | "dataPointSelect";
  moduleId: string;
  moduleType: string;
  selectedData?: unknown;
  timestamp: number;
}

interface EventState {
  events: UserEvent[];
  addEvent: (event: Omit<UserEvent, "timestamp">) => void;
  clearEvents: () => void;
  getRecentEvents: (lastNSeconds: number) => UserEvent[];
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (event) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              ...event,
              timestamp: Date.now(),
            },
          ],
        })),
      clearEvents: () => set({ events: [] }),
      getRecentEvents: (lastNSeconds) => {
        const now = Date.now();
        return get().events.filter(
          (event) => (now - event.timestamp) / 1000 <= lastNSeconds
        );
      },
    }),
    {
      name: "event-storage",
      partialize: (state) => ({
        events: state.events,
      }),
    }
  )
);
