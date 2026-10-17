import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False during server rendering and hydration, true once React runs in the browser. Forms whose
// submit is a client function disable their button until then: a click before hydration
// would otherwise be lost.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
