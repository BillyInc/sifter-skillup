/**
 * Test helper. Student-facing body copy adds first-use glossary definitions in
 * parentheses after technical terms, e.g. "evidence (information examined ...)".
 * plainText() returns a RegExp that matches the stable wording while tolerating
 * those inline definitions (which may themselves contain parentheses) after any
 * word. Card titles, headings, button labels and link labels are NOT glossed and
 * should still be asserted with exact strings. Pass { exact: false } to match only the start of the text
 * (for example when more paragraphs follow in the same Text node).
 */
export const plainText = (expected: string, { exact = true }: { exact?: boolean } = {}): RegExp => {
  const escape = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const gloss = "(?: \\(.*?\\))?";
  // A definition is inserted straight after the term, before any trailing punctuation.
  const word = (token: string) => {
    const core = token.replace(/[.,;:!?]+$/, "");
    return `${escape(core)}${gloss}${escape(token.slice(core.length))}`;
  };
  return new RegExp(`^${expected.split(" ").map(word).join(" ")}${exact ? "$" : ""}`);
};
