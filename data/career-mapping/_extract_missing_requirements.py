#!/usr/bin/env python3
"""Extract missing UTME requirement text from the brochure text files.

The brochure pages are a 3-column PDF dump:
  left  (col 0-49):  programme heading (WRAPS across lines) + institution codes
  right (col 50+):   requirement text — "UTME SUBJECTS" marker, then either a
                     general statement or an institution-specific list
                     ("(i) AAU requires ...").

Approach:
  1. Build the LEFT-COLUMN STREAM: (line_idx, text) for every line with a
     non-space char at column 0, minus page-header noise.
  2. Match every programme name (from the offerings file) against the
     CONCATENATED stream so wrapped names match; heading position = first
     stream entry of the match. Names repeat per page — keep all positions.
  3. Block = lines from a heading to the next DIFFERENT programme's heading.
  4. In the block's RIGHT columns, find "UTME SUBJECTS"; text until the first
     roman-numeral waiver "(i)" is the GENERAL statement (confidence high).
     If the waivers start immediately there is NO general statement — capture
     the whole institution-specific list verbatim (confidence low, goes to
     jamb/enrich/_auto_review/ for eyeballing, never merged automatically).
  5. Never guess: unfindable heading or no UTME text -> skipped, reported.

Run:  python _extract_missing_requirements.py            (dry run)
      python _extract_missing_requirements.py --write    (write files)
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TXT = os.path.join(HERE, "_jamb_txt")
COL = 50  # left/right column boundary

SOURCES = {
    "sciences_offerings.json": ("Sciences.txt", "sciences"),
    "administration_offerings.json": ("Administration.txt", "administration"),
    "social_management_offerings.json": ("Social Management Science.txt", "social_management"),
    "arts_hum_offerings.json": ("arts_hum.txt", "arts_hum"),
    "engineering_offerings.json": ("engineering.txt", "engineering"),
    "education_offerings.json": ("education.txt", "education"),
    "medical_offerings.json": ("medical.txt", "medical"),
    "agriculture_offerings.json": ("agriculture.txt", "agriculture"),
    "law_offerings.json": ("Law.txt", "law"),
}

HEADER_NOISE = re.compile(
    r"^(SCIENCES|ADMINISTRATION|LAW|EDUCATION|MEDICAL|AGRICULTURE|ENGINEERING|"
    r"ARTS|SOCIAL|PROGRAMME/DEGREE|AWARDING INSTITUTIONS|\f|\x0c)", re.I)
WAIVER = re.compile(r"^\(?\s*[ivxlcdm]+\s*\)|^\([a-z]\)", re.I)
UTME_MARK = re.compile(r"UTME\s+SUBJECTS?\s*:?", re.I)


def norm(s):
    return re.sub(r"[^a-z0-9 ]", " ", re.sub(r"\s+", " ", s).strip().lower()).strip()


def build_stream(lines):
    """Left-column stream: (line_idx, text at col 0)."""
    stream = []
    for i, ln in enumerate(lines):
        if not ln or ln[0].isspace():
            continue
        left = ln[:COL].strip()
        if not left or HEADER_NOISE.match(left):
            continue
        stream.append((i, left))
    return stream


def match_headings(stream, names):
    """name -> [stream indices where the (possibly wrapped) name starts]."""
    toks = [(i, norm(t)) for i, (_, t) in enumerate(stream)]
    out = {}
    for name in names:
        n = norm(name)
        if not n:
            continue
        hits = []
        for si in range(len(toks)):
            joined = toks[si][1]
            sj = si
            while len(joined) < len(n) and sj + 1 < len(toks):
                sj += 1
                joined = joined + " " + toks[sj][1]
            if joined == n or joined.startswith(n + " ") or joined == n.rstrip("s"):
                hits.append(si)
        if hits:
            out[name] = hits
    return out


def right_text(lines, i0, i1):
    """Right-column text of lines[i0:i1], joined."""
    parts = []
    for ln in lines[i0:i1]:
        r = ln[COL:].strip()
        if r and not HEADER_NOISE.match(r) and not re.match(r"^(DIRECT ENTRY|UTME\s*$|SUBJECTS?\s*$|\d{1,4}\s*$)", r, re.I):
            parts.append(r)
    return parts


def extract_utme(parts):
    """(general_statement, waiver_block) from right-column lines."""
    # find marker
    start = None
    for i, p in enumerate(parts):
        if UTME_MARK.search(p):
            tail = UTME_MARK.split(p, 1)[1].strip(" :")
            start = i + 1
            lead = [tail] if tail else []
            break
    if start is None:
        return None, None
    general, waivers, in_waivers = list(lead), [], False
    for p in parts[start:]:
        if UTME_MARK.search(p):
            break
        if WAIVER.match(p):
            in_waivers = True
        (waivers if in_waivers else general).append(p)
        if len(general) > 8 and not in_waivers:
            break  # general statements are short; runaway means mis-scoped block
    g = re.sub(r"\s+", " ", " ".join(general)).strip()
    w = re.sub(r"\s+", " ", " ".join(waivers)).strip()
    if len(g) > 260:
        g = ""  # not a real general statement
    return (g or None), (w or None)


def slugify(name):
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")[:60]


def main():
    write = "--write" in sys.argv
    auto_dir = os.path.join(HERE, "jamb", "enrich")
    review_dir = os.path.join(HERE, "jamb", "enrich", "_auto_review")
    if write:
        os.makedirs(review_dir, exist_ok=True)

    enriched = set()
    for f in glob.glob(os.path.join(auto_dir, "*.json")):
        if os.path.basename(f).startswith("_"):
            continue
        try:
            enriched.add(json.load(open(f, encoding="utf-8")).get("jamb_name"))
        except Exception:
            pass

    T = {"high": 0, "review": 0, "skipped": 0}
    for off_file, (txt_file, prefix) in SOURCES.items():
        off_path = os.path.join(HERE, "jamb", off_file)
        txt_path = os.path.join(TXT, txt_file)
        if not (os.path.exists(off_path) and os.path.exists(txt_path)):
            continue
        d = json.load(open(off_path, encoding="utf-8"))

        def has_req(p):
            u = p.get("utme_subjects")
            if isinstance(u, list):
                return any(str(x).strip() for x in u)
            return bool((u or "").strip())

        all_names = [p["jamb_name"] for p in d["programmes"]]
        missing = [n for n in all_names if n not in enriched
                   and not has_req(next(p for p in d["programmes"] if p["jamb_name"] == n))]
        if not missing:
            continue
        lines = open(txt_path, encoding="utf-8", errors="replace").read().splitlines()
        stream = build_stream(lines)
        headings = match_headings(stream, all_names)
        # ordered list of (stream index, name) boundaries
        bounds = sorted((si, nm) for nm, sis in headings.items() for si in sis)

        high = review = skipped = 0
        for name in missing:
            sis = headings.get(name)
            if not sis:
                skipped += 1
                continue
            # collect right-column text across ALL this programme's page segments
            parts = []
            for si in sis:
                start_line = stream[si][0]
                end_line = len(lines)
                for bsi, bnm in bounds:
                    if bsi > si and bnm != name:
                        end_line = stream[bsi][0]
                        break
                parts.extend(right_text(lines, start_line, min(end_line, start_line + 160)))
            general, waivers = extract_utme(parts)
            if not general and not waivers:
                skipped += 1
                continue
            rec = {"jamb_name": name, "extraction_source": txt_file}
            if general:
                rec["utme_subjects"] = general
                rec["extraction_confidence"] = "high"
                dest, key = auto_dir, "high"
                high += 1
            else:
                # institution-specific only: capture verbatim for human review
                rec["utme_subjects"] = "Varies by institution: " + waivers[:900]
                rec["extraction_confidence"] = "low"
                dest, key = review_dir, "review"
                review += 1
            if general and waivers:
                rec["institution_waivers_text"] = waivers[:900]
            if write:
                json.dump(rec, open(os.path.join(dest, f"{prefix}__{slugify(name)}.json"),
                                    "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        T["high"] += high
        T["review"] += review
        T["skipped"] += skipped
        print(f"{off_file:38s} missing={len(missing):3d}  high={high:3d}  review={review:3d}  skipped={skipped:3d}")

    print(f"\nTOTAL: general-statement={T['high']}  institution-specific(review)={T['review']}  unfindable={T['skipped']}")
    if not write:
        print("(dry run — re-run with --write)")
    else:
        print("high -> jamb/enrich/    review -> jamb/enrich/_auto_review/ (eyeball, then move keepers)")
        print("then: python _gen_seed.py && python _parse_subject_options.py")


if __name__ == "__main__":
    main()
