/**
 * ComingSoonPanel — the admin-side state-branch wrapper.
 *
 * Thin adapter over the student-side {@link DataStateView}: same uniform
 * branching on the {@link DataState} union (real / coming_soon / locked /
 * pending / error), so every institutional surface renders a graceful state
 * instead of a blank or a fabricated number. Locked reads (consent-gated
 * student management) surface here too — they never silently disappear.
 *
 * Use it to wrap any data-driven admin block:
 *   <ComingSoonPanel state={state} empty={(r) => r.length === 0}>
 *     {(rows) => <ProgrammeDemandTable rows={rows} />}
 *   </ComingSoonPanel>
 */
import React, { type ReactNode } from "react";
import { DataStateView } from "../../components/careerIntelligence/DataStateView";
import type { DataState } from "../../types/career";

export interface ComingSoonPanelProps<T> {
  state: DataState<T>;
  children: (data: T) => ReactNode;
  /** Treat a `real` value as empty (e.g. an empty array) → empty state. */
  empty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyBody?: string;
  /** Compact single-line variant for inline use inside a panel. */
  compact?: boolean;
}

export function ComingSoonPanel<T>({
  state,
  children,
  empty,
  emptyTitle = "Nothing here yet",
  emptyBody = "There's nothing to show right now.",
  compact,
}: ComingSoonPanelProps<T>) {
  return (
    <DataStateView
      state={state}
      empty={empty}
      emptyTitle={emptyTitle}
      emptyBody={emptyBody}
      compact={compact}
    >
      {children}
    </DataStateView>
  );
}

export default ComingSoonPanel;
