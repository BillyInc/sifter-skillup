import type { DataState } from "@/types/career";

/** Keep pending reads distinct from unavailable and empty successful reads. */
export function adminExploreStateMessage<T>(
  state: DataState<T>,
  loadingMessage: string,
  unavailableMessage: string,
): string | null {
  if (state.status === "pending") return loadingMessage;
  if (state.status === "real") return null;
  return state.meta?.notice?.trim() || unavailableMessage;
}
