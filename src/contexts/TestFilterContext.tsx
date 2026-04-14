"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
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

export function TestFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [excludeTest, setExcludeTestState] = useState<boolean>(
    DEFAULT_EXCLUDE_TEST,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setExcludeTestState(stored === "true");
    }
  }, []);

  const setExcludeTest = useCallback((value: boolean) => {
    setExcludeTestState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
  }, []);

  const toggle = useCallback(() => {
    setExcludeTest(!excludeTest);
  }, [excludeTest, setExcludeTest]);

  return (
    <TestFilterContext.Provider value={{ excludeTest, setExcludeTest, toggle }}>
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
