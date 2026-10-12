import {
  orderSubjectCatalogItems,
  subjectCategoryLabel,
  subjectStreamLabels,
} from "./subjectCatalogOrdering";

describe("orderSubjectCatalogItems", () => {
  const subjects = [
    { id: "econ", name: "Economics", streamTags: ["commercial", "art"] },
    { id: "bio", name: "Biology", streamTags: ["science"] },
    { id: "eng", name: "English Language", streamTags: ["science", "commercial", "art"] },
  ];

  it("filters to a selected stream while retaining cross-listed subjects", () => {
    const ordered = orderSubjectCatalogItems(subjects, "science", ["English Language"]);

    expect(ordered.map((subject) => subject.id)).toEqual(["eng", "bio"]);
  });

  it("normalizes Arts and technical/vocational names", () => {
    const ordered = orderSubjectCatalogItems(
      [
        ...subjects,
        { id: "technical", name: "Technical Drawing", streamTags: ["technical"] },
      ],
      "Technical/Vocational",
    );

    expect(ordered.map((subject) => subject.id)).toEqual(["technical"]);
  });

  it("shows all streams only when no stream is selected", () => {
    expect(orderSubjectCatalogItems(subjects).map((subject) => subject.id)).toHaveLength(3);
  });

  it("labels technical/vocational and preserves overlapping streams", () => {
    expect(subjectCategoryLabel("technical")).toBe("Technical/vocational");
    expect(subjectStreamLabels(["science", "art", "commercial", "technical"])).toEqual([
      "Science",
      "Arts",
      "Commercial",
      "Technical/vocational",
    ]);
  });
});
