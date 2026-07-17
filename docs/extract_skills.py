import csv
import json
from collections import defaultdict

FILE_PATH = r"C:\Users\USER\Documents\sifter-skillup-integrated\docs\github_browser_extract.txt"
OUT_PATH = r"C:\Users\USER\Documents\sifter-skillup-integrated\docs\a2_skills.json"

col_map = {
    65: "language",
    71: "database",
    77: "platform",
    83: "webframework",
    89: "devenv",
}

tech_counts = defaultdict(lambda: {"category": "", "frequency": 0})

with open(FILE_PATH, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)
    row_count = 0
    for row in reader:
        row_count += 1
        for col_idx, category in col_map.items():
            if col_idx < len(row):
                cell = row[col_idx].strip()
                if cell and cell not in ("NA", ""):
                    values = [v.strip() for v in cell.split(";")]
                    for v in values:
                        if v and v != "NA":
                            tech_counts[v]["category"] = category
                            tech_counts[v]["frequency"] += 1

print("Rows processed:", row_count)
print("Unique technologies found:", len(tech_counts))

technologies = []
summary = {
    "languages_count": 0,
    "databases_count": 0,
    "platforms_count": 0,
    "webframeworks_count": 0,
    "devenvs_count": 0,
}

for tech, info in sorted(tech_counts.items(), key=lambda x: -x[1]["frequency"]):
    technologies.append({
        "tech_name": tech,
        "category": info["category"],
        "frequency": info["frequency"],
    })
    if info["category"] == "language":
        summary["languages_count"] += 1
    elif info["category"] == "database":
        summary["databases_count"] += 1
    elif info["category"] == "platform":
        summary["platforms_count"] += 1
    elif info["category"] == "webframework":
        summary["webframeworks_count"] += 1
    elif info["category"] == "devenv":
        summary["devenvs_count"] += 1

output = {"technologies": technologies, "summary": summary}

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print("Written to:", OUT_PATH)
print("Summary:", json.dumps(summary, indent=2))
print("Top 15 by frequency:")
for t in technologies[:15]:
    print("  %s (%s): %d" % (t["tech_name"], t["category"], t["frequency"]))
