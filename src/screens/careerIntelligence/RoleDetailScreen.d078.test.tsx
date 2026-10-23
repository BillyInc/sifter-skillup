import React from "react";
import { render, screen } from "@testing-library/react-native";
import RoleDetailScreen from "./RoleDetailScreen";
import { careerData } from "@/lib/careerData";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn(), canGoBack: () => false }),
  useLocalSearchParams: () => ({ id: "D078|sociologist" }),
}));

jest.mock("@/lib/careerData", () => ({
  careerData: { getRoleV2ForStudent: jest.fn() },
}));

jest.mock("@/components/careerIntelligence", () => ({}));

jest.mock("@/screens/careerIntelligence/D078MethodAwareJourney", () => {
  const ReactModule = require("react");
  const { Text: NativeText } = require("react-native");
  return {
    D078RoleRoute: () => ReactModule.createElement(NativeText, null, "Choose a method and area first"),
    parseD078Selection: () => ({
      methodIds: [], combinationIds: [], componentMethodIds: {}, addedItemIds: [],
    }),
  };
});

describe("RoleDetailScreen D078 route boundary", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the method-aware area guard and does not fetch a role for a direct URL without area_id", () => {
    render(<RoleDetailScreen />);

    expect(screen.getByText("Choose a method and area first")).toBeTruthy();
    expect(careerData.getRoleV2ForStudent).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)/explore/domain/D078");
  });
});
