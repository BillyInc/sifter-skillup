/**
 * Print / share export for one My World collection.
 *
 * Built only from what the student already sees: the collection name, the
 * ordered saved items (label and type) and the student's own private notes.
 * No contact details, ids, account data or other users' content. Nothing is
 * sent to any service: the web build opens a print view in the browser (the
 * student can print or save as PDF) and native uses the system share sheet
 * with plain text, which the student controls.
 */
export interface ExportItem {
  name: string;
  typeLabel: string;
  note?: string | null;
}

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/** Plain-text version, in the collection's order. */
export function collectionToText(collectionName: string, items: ExportItem[]): string {
  const lines = [collectionName, ""];
  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} (${item.typeLabel})`);
    const note = item.note?.trim();
    if (note) lines.push(...note.split("\n").map((line) => `   Note: ${line}`));
  });
  return lines.join("\n");
}

/** A self-contained printable document. All text is escaped. */
export function collectionToPrintHtml(collectionName: string, items: ExportItem[]): string {
  const rows = items
    .map((item) => {
      const note = item.note?.trim();
      const noteHtml = note
        ? `<p class="note"><strong>Note:</strong> ${escapeHtml(note).replace(/\n/g, "<br>")}</p>`
        : "";
      return `<li><span class="name">${escapeHtml(item.name)}</span> <span class="type">${escapeHtml(item.typeLabel)}</span>${noteHtml}</li>`;
    })
    .join("");
  return [
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">",
    `<title>${escapeHtml(collectionName)}</title>`,
    "<style>",
    "body{font:16px/1.5 system-ui,sans-serif;color:#0f172a;max-width:720px;margin:32px auto;padding:0 16px}",
    "h1{font-size:24px;margin:0 0 16px}",
    "ol{padding-left:24px}li{margin:0 0 14px;break-inside:avoid}",
    ".type{color:#475569;font-size:13px;margin-left:6px}.name{font-weight:600}",
    ".note{margin:4px 0 0;color:#1e293b;font-size:14px}",
    "</style></head><body>",
    `<h1>${escapeHtml(collectionName)}</h1>`,
    `<ol>${rows}</ol>`,
    "</body></html>",
  ].join("");
}
