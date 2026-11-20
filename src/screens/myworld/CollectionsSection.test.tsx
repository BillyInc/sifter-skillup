import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { CollectionsSection, REMOVE_FROM_COLLECTION_COPY } from "./CollectionsSection";
import type { SavedItem } from "@/types/career";

const mockData = {
  list: jest.fn(),
  starters: jest.fn(),
  create: jest.fn(),
  rename: jest.fn(),
  remove: jest.fn(),
  items: jest.fn(),
  addItems: jest.fn(),
  removeItem: jest.fn(),
  moveItem: jest.fn(),
};
jest.mock("@/lib/collectionsData", () => ({ collectionsData: new Proxy({}, { get: (_t, k: string) => (mockData as never)[k] }) }));

const savedState = (items: SavedItem[]) => ({ status: "real" as const, data: items });
const sociology: SavedItem = { id: "s1", entityType: "programme", entityId: "p1", label: "BSc Sociology", createdAt: "2026-11-18" };
const analyst: SavedItem = { id: "s2", entityType: "role", entityId: "r1", label: "Data Analyst", createdAt: "2026-11-18" };
const STARTERS = [
  { starterKey: "university_options", name: "My university options", description: "", created: false },
  { starterKey: "career_ideas", name: "Career ideas", description: "", created: false },
];

function renderSection(saved = savedState([sociology, analyst])) {
  return render(
    <ThemeProvider>
      <CollectionsSection saved={saved} />
    </ThemeProvider>,
  );
}

describe("CollectionsSection", () => {
  beforeEach(() => {
    Object.values(mockData).forEach((m) => m.mockReset());
    mockData.starters.mockResolvedValue({ status: "real", data: STARTERS });
  });

  it("shows an honest not-available state when the backend is unsupported", async () => {
    mockData.list.mockResolvedValue({ status: "coming_soon", data: null, meta: { notice: "Collections are not available yet." } });
    renderSection();
    await waitFor(() => expect(screen.getByText("Collections are not available yet")).toBeTruthy());
    expect(screen.queryByRole("button", { name: "New collection" })).toBeNull();
  });

  it("shows an error with retry", async () => {
    mockData.list.mockResolvedValueOnce({ status: "error", data: null, meta: { notice: "boom" } });
    renderSection();
    await waitFor(() => expect(screen.getByText("Collections could not load")).toBeTruthy());
    mockData.list.mockResolvedValueOnce({ status: "real", data: [] });
    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(screen.getByText("No collections yet")).toBeTruthy());
  });

  it("offers starter names as suggestions and creates only on confirm", async () => {
    mockData.list.mockResolvedValue({ status: "real", data: [] });
    mockData.create.mockResolvedValue({ status: "real", data: { id: "c1", name: "Career ideas", kind: "starter", itemCount: 0 } });
    renderSection();
    await waitFor(() => expect(screen.getByText("No collections yet")).toBeTruthy());
    expect(mockData.create).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole("button", { name: "New collection" }));
    fireEvent.press(await screen.findByRole("button", { name: "Use suggestion Career ideas" }));
    expect(screen.getByLabelText("Collection name").props.value).toBe("Career ideas");
    fireEvent.press(screen.getByRole("button", { name: "Create collection" }));
    await waitFor(() => expect(mockData.create).toHaveBeenCalledWith("Career ideas", "career_ideas"));
  });

  it("disables create for an empty name and shows the server's duplicate message", async () => {
    mockData.list.mockResolvedValue({ status: "real", data: [] });
    mockData.create.mockResolvedValue({ status: "error", data: null, meta: { notice: "You already have a collection with that name." } });
    renderSection();
    await waitFor(() => expect(screen.getByText("No collections yet")).toBeTruthy());
    fireEvent.press(screen.getByRole("button", { name: "New collection" }));
    const create = await screen.findByRole("button", { name: "Create collection" });
    expect(create.props.accessibilityState.disabled).toBe(true);
    fireEvent.changeText(screen.getByLabelText("Collection name"), "Ideas");
    fireEvent.press(screen.getByRole("button", { name: "Create collection" }));
    await waitFor(() => expect(screen.getByText("You already have a collection with that name.")).toBeTruthy());
  });

  it("opens a collection, adds a saved item, and removes with the explicit confirmation copy", async () => {
    mockData.list.mockResolvedValue({ status: "real", data: [{ id: "c1", name: "Shortlist", kind: "custom", itemCount: 1 }] });
    mockData.items.mockResolvedValue({
      status: "real",
      data: [{ savedItemId: "s1", entityType: "programme", entityId: "p1", label: "BSc Sociology", position: 0 }],
    });
    mockData.addItems.mockResolvedValue({ status: "real", data: { added: 1, alreadyPresent: 0 } });
    mockData.removeItem.mockResolvedValue({ status: "real", data: null });
    renderSection();

    fireEvent.press(await screen.findByRole("button", { name: "Open collection Shortlist, 1 item" }));
    await waitFor(() => expect(screen.getByText("BSc Sociology")).toBeTruthy());

    // Add: only items not already in the collection are offered.
    fireEvent.press(screen.getByRole("button", { name: "Add saved items" }));
    expect(await screen.findByRole("checkbox", { name: /Data Analyst/ })).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: /BSc Sociology/ })).toBeNull();
    fireEvent.press(screen.getByRole("checkbox", { name: /Data Analyst/ }));
    fireEvent.press(screen.getByRole("button", { name: "Add 1 item" }));
    await waitFor(() => expect(mockData.addItems).toHaveBeenCalledWith("c1", ["s2"]));

    // Remove: explicit confirmation, exact copy, nothing happens before confirm.
    fireEvent.press(screen.getByRole("button", { name: "Remove BSc Sociology from this collection" }));
    expect(await screen.findByText(REMOVE_FROM_COLLECTION_COPY)).toBeTruthy();
    expect(REMOVE_FROM_COLLECTION_COPY).toBe(
      "This removes it from this collection. It does not delete the original programme, role or task item.",
    );
    expect(mockData.removeItem).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole("button", { name: "Remove from collection" }));
    await waitFor(() => expect(mockData.removeItem).toHaveBeenCalledWith("c1", "s1"));
  });

  it("cancel in the remove confirmation keeps the item", async () => {
    mockData.list.mockResolvedValue({ status: "real", data: [{ id: "c1", name: "Shortlist", kind: "custom", itemCount: 1 }] });
    mockData.items.mockResolvedValue({
      status: "real",
      data: [{ savedItemId: "s1", entityType: "programme", entityId: "p1", label: "BSc Sociology", position: 0 }],
    });
    renderSection();
    fireEvent.press(await screen.findByRole("button", { name: "Open collection Shortlist, 1 item" }));
    await waitFor(() => expect(screen.getByText("BSc Sociology")).toBeTruthy());
    fireEvent.press(screen.getByRole("button", { name: "Remove BSc Sociology from this collection" }));
    await screen.findByText(REMOVE_FROM_COLLECTION_COPY);
    fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
    expect(mockData.removeItem).not.toHaveBeenCalled();
  });
});
