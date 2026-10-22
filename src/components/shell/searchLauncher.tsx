import React, { createContext, useContext } from "react";
import type { SearchScope } from "@/types/career";

type SearchLauncher = (query?: string, scope?: SearchScope) => void;

const SearchLauncherContext = createContext<SearchLauncher>(() => {});

export function SearchLauncherProvider({ children, onOpen }: { children: React.ReactNode; onOpen: SearchLauncher }) {
  return <SearchLauncherContext.Provider value={onOpen}>{children}</SearchLauncherContext.Provider>;
}

export function useSearchLauncher(): SearchLauncher {
  return useContext(SearchLauncherContext);
}
