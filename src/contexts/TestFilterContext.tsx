"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "imagiq_exclude_test";
const DEFAULT_EXCLUDE_TEST = true;

interface TestFilterContextType {
  excludeTest: boolean;
  setExcludeTest: (value: boolean) => void;
  toggle: () => void;
}

const TestFilterContext = createContext<TestFilterContextType | undefined>(
  undefined,
);

/**
 * Store externo (localStorage) consumido vía `useSyncExternalStore` para que
 * el estado sea consistente entre:
 *   - Server rendering (usa `getServerSnapshot` → default)
 *   - First client render (usa `getClientSnapshot` → lee localStorage ya)
 *   - Cambios posteriores (suscripción al evento `storage` + evento custom
 *     dentro de la misma pestaña)
 *
 * Esto elimina la condición de carrera del patrón anterior: `useState` con
 * default + `useEffect` que leía localStorage DESPUÉS del primer render
 * forzaba un re-render y disparaba dos fetches consecutivos — el primero con
 * el valor default, el segundo con el valor real. Cualquier fetch en vuelo
 * podía terminar "stale" y marcar un error sobre datos que ya se renderizaron
 * correctamente por el segundo fetch.
 */
const STORAGE_EVENT = "imagiq_exclude_test_change";

function getClientSnapshot(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? DEFAULT_EXCLUDE_TEST : stored === "true";
}

function getServerSnapshot(): boolean {
  return DEFAULT_EXCLUDE_TEST;
}

function subscribe(callback: () => void): () => void {
  // `storage` events no se disparan en la pestaña que escribió; por eso
  // complementamos con un CustomEvent para sincronizar dentro de la misma tab.
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

export function TestFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const excludeTest = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const setExcludeTest = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value));
    // Notifica a todos los suscriptores dentro de la misma pestaña.
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  const toggle = useCallback(() => {
    setExcludeTest(!excludeTest);
  }, [excludeTest, setExcludeTest]);

  const value = useMemo<TestFilterContextType>(
    () => ({ excludeTest, setExcludeTest, toggle }),
    [excludeTest, setExcludeTest, toggle],
  );

  return (
    <TestFilterContext.Provider value={value}>
      {children}
    </TestFilterContext.Provider>
  );
}

export function useTestFilter(): TestFilterContextType {
  const ctx = useContext(TestFilterContext);
  if (!ctx) {
    throw new Error("useTestFilter must be used within TestFilterProvider");
  }
  return ctx;
}
