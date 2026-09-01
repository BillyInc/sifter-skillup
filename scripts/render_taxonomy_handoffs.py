"""Render the two taxonomy handoffs as linked HTML and printable PDFs.

The Markdown remains the source of truth. Mermaid blocks are converted into a
readable flow strip for the PDF because a browser print operation does not
execute Mermaid by itself.
"""

from __future__ import annotations

import argparse
import html
import re
import subprocess
from pathlib import Path

import markdown


MERMAID_BLOCK = re.compile(r"```mermaid\s*\n(.*?)\n```", re.DOTALL)
NODE = re.compile(r"(?:^|\s)([A-Za-z][A-Za-z0-9_]*)\s*[\[{]([^\]}]+)[\]}]")


def flow_strip(source: str) -> str:
    """Create a compact, accessible flow strip from Mermaid node declarations."""
    nodes: list[tuple[str, str]] = []
    seen: set[str] = set()
    for match in NODE.finditer(source):
        key, label = match.groups()
        label = re.sub(r"<br\s*/?>", " ", label).strip()
        if key not in seen:
            nodes.append((key, label))
            seen.add(key)
    if not nodes:
        return (
            '<div class="flow-fallback"><pre>'
            + html.escape(source)
            + "</pre></div>"
        )
    parts = ['<div class="flow-strip" role="img" aria-label="Flow diagram">']
    for index, (_, label) in enumerate(nodes):
        parts.append(f'<span class="flow-node">{html.escape(label)}</span>')
        if index < len(nodes) - 1:
            parts.append('<span class="flow-arrow" aria-hidden="true">→</span>')
    parts.append("</div>")
    parts.append(
        '<details class="flow-source"><summary>View diagram definition</summary>'
        f"<pre>{html.escape(source)}</pre></details>"
    )
    return "".join(parts)


def markdown_to_html(source: str, title: str, base_dir: Path) -> str:
    source = MERMAID_BLOCK.sub(lambda m: flow_strip(m.group(1)), source)
    body = markdown.markdown(
        source,
        extensions=["tables", "fenced_code", "toc", "sane_lists"],
        output_format="html5",
    )
    base_uri = base_dir.resolve().as_uri() + "/"
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <base href="{html.escape(base_uri)}">
  <title>{html.escape(title)}</title>
  <style>
    @page {{ size: A4; margin: 16mm 14mm 17mm; }}
    :root {{ color-scheme: light; }}
    body {{ font-family: Arial, Helvetica, sans-serif; color: #172033; line-height: 1.42; font-size: 10.2pt; }}
    h1 {{ color: #102a43; font-size: 23pt; border-bottom: 3px solid #2c7a7b; padding-bottom: 7px; margin-bottom: 13px; }}
    h2 {{ color: #155e75; font-size: 15pt; margin-top: 22px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }}
    h3 {{ color: #334e68; font-size: 12pt; margin-top: 16px; }}
    h4 {{ color: #486581; font-size: 10.8pt; }}
    p {{ margin: 6px 0 8px; }}
    a {{ color: #075985; text-decoration: underline; }}
    table {{ width: 100%; border-collapse: collapse; margin: 9px 0 14px; page-break-inside: auto; }}
    tr {{ page-break-inside: avoid; page-break-after: auto; }}
    th {{ background: #e6fffa; color: #164e63; text-align: left; font-weight: 700; }}
    th, td {{ border: 1px solid #b8c4ce; padding: 5px 6px; vertical-align: top; }}
    code {{ font-family: Consolas, "Courier New", monospace; font-size: 0.88em; color: #7c2d12; background: #fff7ed; padding: 1px 3px; }}
    pre {{ white-space: pre-wrap; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 5px; padding: 8px; font-size: 8.2pt; }}
    blockquote {{ border-left: 4px solid #2c7a7b; margin: 10px 0; padding: 2px 12px; background: #f0fdfa; }}
    .flow-strip {{ display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin: 10px 0 5px; padding: 10px; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 7px; page-break-inside: avoid; }}
    .flow-node {{ display: inline-block; max-width: 175px; padding: 7px 9px; color: #164e63; background: white; border: 2px solid #2c7a7b; border-radius: 6px; font-size: 8.5pt; font-weight: 600; text-align: center; }}
    .flow-arrow {{ color: #0f766e; font-size: 15pt; font-weight: 700; }}
    .flow-source {{ margin: 2px 0 11px; font-size: 8pt; }}
    .flow-source summary {{ color: #0f766e; cursor: pointer; }}
    .flow-fallback {{ margin: 8px 0; }}
    ul, ol {{ padding-left: 22px; }}
    li {{ margin: 3px 0; }}
    hr {{ border: 0; border-top: 1px solid #cbd5e1; margin: 15px 0; }}
  </style>
</head>
<body>
{body}
</body>
</html>
"""


def render_one(markdown_path: Path, output_dir: Path, browser: Path) -> tuple[Path, Path]:
    source = markdown_path.read_text(encoding="utf-8")
    title = markdown_path.stem.replace("_", " ").replace("CAREER", "Career")
    html_path = (output_dir / f"{markdown_path.stem}.html").resolve()
    pdf_path = (output_dir / f"{markdown_path.stem}.pdf").resolve()
    profile_dir = (output_dir / ".edge-profile").resolve()
    profile_dir.mkdir(parents=True, exist_ok=True)
    html_path.write_text(markdown_to_html(source, title, markdown_path.parent), encoding="utf-8")
    subprocess.run(
        [
            str(browser),
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--allow-file-access-from-files",
            f"--user-data-dir={profile_dir}",
            f"--print-to-pdf={pdf_path}",
            html_path.as_uri(),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return html_path, pdf_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument(
        "--browser",
        type=Path,
        default=Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
    )
    parser.add_argument("markdown", nargs="+", type=Path)
    args = parser.parse_args()
    args.output_dir = args.output_dir.resolve()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for path in args.markdown:
        html_path, pdf_path = render_one(path, args.output_dir, args.browser)
        print(f"{path} -> {html_path} -> {pdf_path}")


if __name__ == "__main__":
    main()
