import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

export type Href = string | { pathname: string; params?: Record<string, string | number | undefined> };
export type Router = {
  push: (href: Href) => void;
  replace: (href: Href) => void;
  back: () => void;
  dismissTo?: (href: Href) => void;
};

function toHref(href: Href): string {
  if (typeof href === "string") return href;
  const params = new URLSearchParams();
  Object.entries(href.params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const query = params.toString();
  return `${href.pathname}${query ? `?${query}` : ""}`;
}

function browserPath(href: Href): string {
  const value = toHref(href)
    .replace(/^\/\(tabs\)/, "")
    .replace(/^\/\(admin\)\/workspace-explore/, "/admin/workspace-explore")
    .replace(/^\/\(admin\)/, "/admin")
    .replace(/^\/\(auth\)/, "");
  return value || "/";
}

function announce(path: string, replace = false) {
  if (replace) window.history.replaceState({}, "", path);
  else window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useRouter(): Router {
  return useMemo(() => ({
    push: (href) => announce(browserPath(href)),
    replace: (href) => announce(browserPath(href), true),
    back: () => window.history.back(),
    dismissTo: (href) => announce(browserPath(href), true),
  }), []);
}

function currentLocation() {
  return `${window.location.pathname}${window.location.search}`;
}

export function usePathname() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  return path;
}

export function useLocalSearchParams<T extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>>() {
  const [location, setLocation] = useState(currentLocation);
  useEffect(() => {
    const update = () => setLocation(currentLocation());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  return useMemo(() => {
    const params = Object.fromEntries(new URLSearchParams(location.split("?")[1] ?? "").entries());
    const pathname = location.split("?")[0];
    const segments = pathname.split("/").filter(Boolean).map((segment) => decodeURIComponent(segment));
    const setPathParam = (key: string, marker: string) => {
      const markerIndex = segments.indexOf(marker);
      if (markerIndex >= 0 && segments[markerIndex + 1]) params[key] ??= segments[markerIndex + 1];
    };
    setPathParam("id", "domain");
    setPathParam("subgroupId", "subgroup");
    setPathParam("id", "programme");
    setPathParam("id", "role");
    setPathParam("id", "elite");
    setPathParam("id", "opportunity");
    setPathParam("id", "organisation");
    setPathParam("userId", "students");
    setPathParam("jambName", "admission");
    if (segments.length && !params.id) {
      const last = segments.at(-1) ?? "";
      if (!["guidance", "index"].includes(last)) params.id = last;
    }
    return params as T;
  }, [location]);
}

export const useGlobalSearchParams = useLocalSearchParams;

export function useFocusEffect(effect: () => void | (() => void)) {
  useEffect(effect, []);
}

export function Redirect({ href }: { href: Href }) {
  const router = useRouter();
  useEffect(() => router.replace(href), [href, router]);
  return null;
}

export function Link({ href, children, ...props }: { href: Href; children?: ReactNode } & Record<string, unknown>) {
  const target = browserPath(href);
  return <a href={target} {...props} onClick={(event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    announce(target);
  }}>{children}</a>;
}

export function Stack({ children }: { children?: ReactNode }) { return <>{children}</>; }
Stack.Screen = () => null;
export function Tabs({ children }: { children?: ReactNode }) { return <>{children}</>; }
Tabs.Screen = () => null;
