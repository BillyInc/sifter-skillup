import React, { createContext, useContext } from "react";

type SearchLauncher = (query?: string) => void;

const SearchLauncherContext = createContext<SearchLauncher>(() => {});

export function SearchLauncherProvider({ children, onOpen }: { children: React.ReactNode; onOpen: SearchLauncher }) {
  return <SearchLauncherContext.Provider value={onOpen}>{children}</SearchLauncherContext.Provider>;
}

export function useSearchLauncher(): SearchLauncher {
  return useContext(SearchLauncherContext);
}
