/**
 * Client for My World collections (`/api/career/collections`).
 *
 * Collections are named groups of the student's saved items. They reference
 * `saved_items`; removing an item from a collection or deleting a collection
 * never deletes the saved item or any programme / role / task item.
 *
 * Every method resolves to a {@link DataState}. When the backend reports the
 * feature is not deployed it returns `coming_soon`; callers render an honest
 * "not available yet" state. Mutations surface the server's message
 * (validation, duplicate name) through `error().meta.notice`.
 */
import { request } from "./api";
import {
  error,
  type Collection,
  type CollectionItem,
  type CollectionStarter,
  type DataState,
} from "../types/career";

const BASE = "/api/career/collections";
const enc = encodeURIComponent;

async function call<T>(path: string, init: RequestInit | undefined, fallback: string): Promise<DataState<T>> {
  try {
    return await request<DataState<T>>(path, init as never);
  } catch (e) {
    const message = e instanceof Error && e.message ? e.message : fallback;
    return error<T>(message);
  }
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

export const collectionsData = {
  list: () => call<Collection[]>(BASE, undefined, "Collections are temporarily unavailable."),

  starters: () => call<CollectionStarter[]>(`${BASE}/starters`, undefined, "Suggestions are unavailable."),

  create: (name: string, starterKey?: string) =>
    call<Collection>(BASE, { method: "POST", ...json({ name, ...(starterKey ? { starterKey } : {}) }) },
      "Could not create the collection."),

  rename: (id: string, name: string) =>
    call<Collection>(`${BASE}/${enc(id)}`, { method: "PATCH", ...json({ name }) }, "Could not rename the collection."),

  remove: (id: string) =>
    call<null>(`${BASE}/${enc(id)}`, { method: "DELETE" }, "Could not delete the collection."),

  items: (id: string) =>
    call<CollectionItem[]>(`${BASE}/${enc(id)}/items`, undefined, "Could not load this collection."),

  addItems: (id: string, savedItemIds: string[]) =>
    call<{ added: number; alreadyPresent: number }>(
      `${BASE}/${enc(id)}/items`,
      { method: "POST", ...json({ savedItemIds }) },
      "Could not add those items.",
    ),

  /** Removes the item from this collection only. */
  removeItem: (id: string, savedItemId: string) =>
    call<null>(`${BASE}/${enc(id)}/items/${enc(savedItemId)}`, { method: "DELETE" }, "Could not remove that item."),

  /** Saves the full order: every current member's id, once each. */
  reorder: (id: string, savedItemIds: string[]) =>
    call<{ count: number }>(
      `${BASE}/${enc(id)}/order`,
      { method: "PATCH", ...json({ savedItemIds }) },
      "Could not save the new order.",
    ),

  /** Sets a private note; blank or null clears it. */
  setNote: (id: string, savedItemId: string, note: string | null) =>
    call<{ savedItemId: string; note: string | null }>(
      `${BASE}/${enc(id)}/items/${enc(savedItemId)}`,
      { method: "PATCH", ...json({ note }) },
      "Could not save the note.",
    ),

  moveItem: (id: string, savedItemId: string, toCollectionId: string) =>
    call<{ moved: boolean }>(
      `${BASE}/${enc(id)}/items/${enc(savedItemId)}/move`,
      { method: "POST", ...json({ toCollectionId }) },
      "Could not move that item.",
    ),
};
