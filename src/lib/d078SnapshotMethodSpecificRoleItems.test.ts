import {
  d078GraphDataForTests,
  INITIAL_D078_SELECTION,
  projectD078Route,
  selectD078Area,
  selectD078Role,
  toggleD078AddedItem,
  toggleD078Method,
} from "@/lib/d078RouteProjection";
import { supportedD078Selection } from "@/lib/d078Snapshot";

describe("D078 snapshot method-specific role items", () => {
  it("keeps a method-routed area enrichment item selectable in a saved route", () => {
    const graph = d078GraphDataForTests();
    let chosen: { methodId: string; areaId: string; itemId: string } | undefined;
    for (const methodId of graph.method_node_ids) {
      const methodSelection = toggleD078Method(INITIAL_D078_SELECTION, methodId);
      for (const route of graph.method_area_routes.filter((entry) => entry.method_id === methodId)) {
        const itemId = [
          ...(route.task_linked_domain_item_ids ?? []),
          ...(route.available_item_ids ?? []),
          ...(route.domain_downstream_item_ids ?? []),
        ].find((id) => (id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:"))
          && (projectD078Route(methodSelection).areaItemIdsByArea[route.area_id] ?? []).includes(id));
        if (itemId) {
          chosen = { methodId, areaId: route.area_id, itemId };
          break;
        }
      }
      if (chosen) break;
    }
    expect(chosen).toBeTruthy();

    const methodSelection = toggleD078Method(INITIAL_D078_SELECTION, chosen!.methodId);
    const areaSelection = selectD078Area(methodSelection, chosen!.areaId);
    const added = toggleD078AddedItem(areaSelection, chosen!.itemId);
    expect(added.addedItemIds).toContain(chosen!.itemId);
    expect(supportedD078Selection(added).addedItemIds).toContain(chosen!.itemId);
  });

  it("preserves an explicitly selected method-role item only while its supported route remains", () => {
    const graph = d078GraphDataForTests();
    const methodId = "domain-item:d078-interviews";
    const areaId = "D078:sociology-social-anthropology";
    const methodSelection = toggleD078Method(INITIAL_D078_SELECTION, methodId);
    const routeRole = projectD078Route({ ...methodSelection, areaId }).visibleRoles[0];
    expect(routeRole).toBeTruthy();

    const route = graph.method_area_role_routes.find((entry) =>
      entry.method_id === methodId && entry.area_id === areaId && entry.role_id === routeRole!.roleId,
    );
    expect(route).toBeTruthy();
    const itemId = "role-method-item:test-evidence-backed-specific-option";
    const originalIds = [...route!.method_specific_role_item_ids];
    route!.method_specific_role_item_ids.push(itemId);
    try {
      const selection = selectD078Role(selectD078Area(methodSelection, areaId), routeRole!.roleId);
      const withItem = { ...selection, addedItemIds: [itemId] };
      expect(projectD078Route(withItem).methodSpecificRoleItemIds).toContain(itemId);
      expect(supportedD078Selection(withItem).addedItemIds).toContain(itemId);

      const withoutSupportingMethod = supportedD078Selection({
        ...withItem,
        methodIds: [],
      });
      expect(withoutSupportingMethod.addedItemIds).not.toContain(itemId);
    } finally {
      route!.method_specific_role_item_ids.splice(0, route!.method_specific_role_item_ids.length, ...originalIds);
    }
  });
});
