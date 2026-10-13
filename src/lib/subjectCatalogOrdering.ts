export type StreamSortableSubject = {
  name: string;
  streamTags?: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  science: "Science",
  commercial: "Commercial",
  art: "Arts",
  language: "Language",
  technical: "Technical/vocational",
};

export function subjectCategoryLabel(category?: string | null): string | null {
  return category ? CATEGORY_LABELS[category.trim().toLowerCase()] ?? null : null;
}

export function subjectStreamLabels(tags?: string[]): string[] {
  const labels: Record<string, string> = {
    science: "Science",
    commercial: "Commercial",
    art: "Arts",
    technical: "Technical/vocational",
  };
  return [
    ...new Set(
      (tags ?? [])
        .map((tag) => labels[tag.trim().toLowerCase()])
        .filter((label): label is string => Boolean(label)),
    ),
  ];
}

export function normalizeSubjectStream(stream?: string): string | undefined {
  const requested = stream?.trim().toLowerCase();
  if (requested === "arts") return "art";
  if (requested === "technical/vocational") return "technical";
  return requested || undefined;
}

/** Filter to the chosen stream; cross-listed subjects remain in every tagged stream. */
export function filterSubjectCatalogItems<T extends StreamSortableSubject>(
  subjects: T[],
  stream?: string,
): T[] {
  const selectedStream = normalizeSubjectStream(stream);
  if (!selectedStream) return [...subjects];
  return subjects.filter((subject) =>
    subject.streamTags?.some((tag) => tag.trim().toLowerCase() === selectedStream),
  );
}

export function orderSubjectCatalogItems<T extends StreamSortableSubject>(
  subjects: T[],
  stream?: string,
  fixedNames: string[] = [],
): T[] {
  const fixed = new Set(fixedNames.map((name) => name.toLowerCase()));
  const visible = filterSubjectCatalogItems(subjects, stream);

  return visible.sort((a, b) => {
    const aFixed = fixed.has(a.name.toLowerCase()) ? 0 : 1;
    const bFixed = fixed.has(b.name.toLowerCase()) ? 0 : 1;
    if (aFixed !== bFixed) return aFixed - bFixed;
    return a.name.localeCompare(b.name);
  });
}
