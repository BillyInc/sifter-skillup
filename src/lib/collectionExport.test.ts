import { collectionToPrintHtml, collectionToText, escapeHtml } from "./collectionExport";

const ITEMS = [
  { name: "BSc Sociology", typeLabel: "Programme", note: "Ask about fees.\nCheck cut-off." },
  { name: "Data Analyst", typeLabel: "Role", note: null },
];

describe("collection export", () => {
  it("keeps the collection's order and the student's notes in plain text", () => {
    expect(collectionToText("Shortlist", ITEMS)).toBe(
      ["Shortlist", "", "1. BSc Sociology (Programme)", "   Note: Ask about fees.", "   Note: Check cut-off.", "2. Data Analyst (Role)"].join("\n"),
    );
  });

  it("escapes every text value in the print document", () => {
    const html = collectionToPrintHtml('<b>"A" & B</b>', [{ name: "<script>x</script>", typeLabel: "Role", note: "<img onerror=1>" }]);
    expect(html).not.toContain("<script>x");
    expect(html).not.toContain("<img onerror");
    expect(html).toContain("&lt;script&gt;x&lt;/script&gt;");
    expect(html).toContain("&lt;b&gt;&quot;A&quot; &amp; B&lt;/b&gt;");
  });

  it("lists items in order and omits a note line when there is no note", () => {
    const html = collectionToPrintHtml("Shortlist", ITEMS);
    expect(html.indexOf("BSc Sociology")).toBeLessThan(html.indexOf("Data Analyst"));
    expect((html.match(/class="note"/g) ?? []).length).toBe(1);
    expect(html).toContain("Ask about fees.<br>Check cut-off.");
  });

  it("includes nothing but names, types and notes", () => {
    const html = collectionToPrintHtml("Shortlist", ITEMS) + collectionToText("Shortlist", ITEMS);
    expect(html).not.toMatch(/@|savedItemId|entityId|user/i);
  });

  it("escapeHtml handles quotes", () => {
    expect(escapeHtml(`'"&<>`)).toBe("&#39;&quot;&amp;&lt;&gt;");
  });
});
