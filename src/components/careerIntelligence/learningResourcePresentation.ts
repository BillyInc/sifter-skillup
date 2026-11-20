export type LearningResourceMediaType = "book" | "document" | "video" | "course" | "tutorial" | "dataset" | "software" | "webpage";
export type LearningResourceLevel = "beginner" | "intermediate" | "advanced" | "expert" | "all_levels";

export interface LearningResourceDescriptor {
  title?: string | null;
  url?: string | null;
  kind?: string | null;
  delivery?: string | null;
  resourceType?: string | null;
  mediaType?: LearningResourceMediaType | null;
  learningLevel?: LearningResourceLevel | null;
  sequenceOrder?: number | null;
}

const LEVEL_ORDER: Record<LearningResourceLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  expert: 3,
  all_levels: 4,
};

export function learningResourceMediaType(resource: LearningResourceDescriptor): LearningResourceMediaType {
  if (resource.mediaType) return resource.mediaType;
  const value = `${resource.kind ?? ""} ${resource.delivery ?? ""} ${resource.resourceType ?? ""} ${resource.title ?? ""}`.toLowerCase();
  if (/video|youtube|vimeo|watch|webinar|lecture recording/.test(value)) return "video";
  if (/ebook|e-book|textbook|monograph|book/.test(value)) return "book";
  if (/pdf|document|report|paper|article|guide|manual|download/.test(value)) return "document";
  if (/course|mooc|open courseware/.test(value)) return "course";
  if (/tutorial|walkthrough|how to/.test(value)) return "tutorial";
  if (/dataset|data set/.test(value)) return "dataset";
  if (/software|application|tool/.test(value)) return "software";
  const url = (resource.url ?? "").toLowerCase();
  if (/youtube\.com|youtu\.be|vimeo\.com/.test(url) || /\.(mp4|webm)(?:$|\?)/.test(url)) return "video";
  if (/\.(pdf|doc|docx|odt)(?:$|\?)/.test(url) || url.includes("docs.google.com/document")) return "document";
  if (/\.(epub|mobi)(?:$|\?)/.test(url)) return "book";
  return "webpage";
}

export function learningResourceMediaLabel(resource: LearningResourceDescriptor): string {
  const labels: Record<LearningResourceMediaType, string> = {
    book: "Book",
    document: "Document",
    video: "Video",
    course: "Course",
    tutorial: "Tutorial",
    dataset: "Dataset",
    software: "Software",
    webpage: "Web page",
  };
  return labels[learningResourceMediaType(resource)];
}

export function learningResourceLevelLabel(level?: LearningResourceLevel | null): string {
  if (!level) return "Level not specified";
  if (level === "all_levels") return "All levels";
  return level[0].toUpperCase() + level.slice(1);
}

export function sortLearningResources<T extends LearningResourceDescriptor>(resources: T[]): T[] {
  return resources
    .map((resource, index) => ({ resource, index }))
    .sort((left, right) => {
      const leftRank = left.resource.learningLevel ? LEVEL_ORDER[left.resource.learningLevel] : Number.MAX_SAFE_INTEGER;
      const rightRank = right.resource.learningLevel ? LEVEL_ORDER[right.resource.learningLevel] : Number.MAX_SAFE_INTEGER;
      const levelDifference = leftRank - rightRank;
      if (levelDifference) return levelDifference;
      const leftOrder = left.resource.sequenceOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.resource.sequenceOrder ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.index - right.index;
    })
    .map(({ resource }) => resource);
}

export function learningResourceIcon(resource: LearningResourceDescriptor): string {
  const icons: Record<LearningResourceMediaType, string> = {
    book: "book-open",
    document: "file-text",
    video: "play-circle",
    course: "book",
    tutorial: "tool",
    dataset: "database",
    software: "monitor",
    webpage: "external-link",
  };
  return icons[learningResourceMediaType(resource)];
}
