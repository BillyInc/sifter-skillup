export interface AuthoredLessonExample {
  contextTag?: string;
  context?: string;
  scenario: string;
  outcome: string;
}

export interface AuthoredLesson {
  id?: string | number;
  title?: string;
  topic?: string;
  explanation?: string;
  keyTakeaway?: string;
  fact?: string;
  plain?: string;
  simulatorLesson?: string;
  guidedPractice?: {
    question: string;
    options?: string[];
    correct?: number;
    explanation?: string;
    hint?: string;
  }[];
  interactiveSimulator?: { componentId?: string; title?: string };
  lessonSimulations?: {
    type: string;
    simulatorId?: string;
    scenario: string;
    scoringCriteria: string[];
  }[];
  examples?: AuthoredLessonExample[];
}

export function truncateAuthoredLessonText(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1).trimEnd()}...`;
}

export function isAuthoredLesson(value: unknown): value is AuthoredLesson {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as AuthoredLesson;
  return typeof candidate.explanation === 'string' || Array.isArray(candidate.guidedPractice);
}

export function getAuthoredLessonTopic(lesson: AuthoredLesson): string {
  return lesson.title ?? lesson.topic ?? 'Starknet Lesson';
}

export function getAuthoredLessonSummary(lesson: AuthoredLesson): string {
  if (lesson.keyTakeaway?.trim()) {
    return lesson.keyTakeaway.trim();
  }
  if (lesson.fact?.trim()) {
    return lesson.fact.trim();
  }
  return truncateAuthoredLessonText(lesson.explanation ?? '', 400);
}

export function getAuthoredLessonPlain(lesson: AuthoredLesson): string {
  if (lesson.plain?.trim()) {
    return lesson.plain.trim();
  }
  if (lesson.keyTakeaway?.trim()) {
    return lesson.keyTakeaway.trim();
  }
  return truncateAuthoredLessonText(lesson.explanation ?? '', 240);
}
