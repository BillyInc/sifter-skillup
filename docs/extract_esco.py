import csv
import json
import sys
import os

DATA_DIR = r"C:\Users\USER\Documents\sifter-skillup-integrated\docs\temp_esco_csv"
OUTPUT_FILE = r"C:\Users\USER\Documents\sifter-skillup-integrated\docs\esco_extracted.json"

def get_isco_major_group(code):
    """Get the ISCO major group (first digit of code) which determines career domain.
    1=Managers, 2=Professionals, 3=Technicians, etc."""
    code_str = str(code).strip()
    if len(code_str) == 0:
        return 0
    return int(code_str[0])

def get_isco_hierarchy_level(code):
    """Determine ISCO hierarchy depth from code length: 1-digit=L1, 2-digit=L2, etc."""
    code_str = str(code).strip()
    return len(code_str) if code_str else 0

def get_parent_code(code):
    """Get parent code by removing last digit."""
    code_str = str(code).strip()
    if len(code_str) <= 1:
        return None
    return code_str[:-1]

def is_university_eligible(isco_code):
    """
    Filter for university-eligible career domains.
    Include ISCO major groups 1-3 (managers, professionals, technicians)
    Exclude 4 (clerical), 5 (service/sales), 6 (agriculture), 
    7 (craft), 8 (plant/machine operators), 9 (elementary)
    Also exclude 0 (armed forces)
    """
    if not isco_code:
        return False
    code_str = str(isco_code).strip()
    if len(code_str) == 0:
        return False
    major_digit = int(code_str[0])
    return major_digit in [1, 2, 3]

def parse_csv_file(filepath):
    """Parse CSV file with proper handling of multi-line fields."""
    rows = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def clean_alt_labels(alt_labels_str):
    """Parse altLabels which may be newline-separated within CSV field."""
    if not alt_labels_str or alt_labels_str.strip() == '':
        return []
    # Alt labels are separated by newlines within the CSV field
    labels = [l.strip() for l in alt_labels_str.split('\n') if l.strip()]
    return labels

# ── Step 1: Parse ISCO Groups ──
print("Parsing ISCO groups...")
isco_rows = parse_csv_file(os.path.join(DATA_DIR, 'ISCOGroups_en.csv'))
isco_hierarchy = []
isco_code_to_info = {}

for row in isco_rows:
    code = row.get('code', '').strip()
    name = row.get('preferredLabel', '').strip()
    if not code or not name:
        continue
    level = get_isco_hierarchy_level(code)
    parent = get_parent_code(code)
    entry = {
        "code": code,
        "name": name,
        "level": level,
        "parent_code": parent
    }
    isco_hierarchy.append(entry)
    isco_code_to_info[code] = entry

print(f"  ISCO groups: {len(isco_hierarchy)}")

# ── Step 2: Parse Occupations ──
print("Parsing occupations...")
occ_rows = parse_csv_file(os.path.join(DATA_DIR, 'occupations_en.csv'))
print(f"  Total occupations in CSV: {len(occ_rows)}")

# Build occupation lookup
occupations_raw = {}
for row in occ_rows:
    uri = row.get('conceptUri', '').strip()
    if not uri:
        continue
    occupations_raw[uri] = {
        "esco_id": uri,
        "preferred_label": row.get('preferredLabel', '').strip(),
        "alt_labels": clean_alt_labels(row.get('altLabels', '')),
        "description": (row.get('description', '') or row.get('definition', '') or '').strip(),
        "isco_code": row.get('iscoGroup', '').strip(),
    }

# ── Step 3: Parse Skills ──
print("Parsing skills...")
skill_rows = parse_csv_file(os.path.join(DATA_DIR, 'skills_en.csv'))
print(f"  Total skills in CSV: {len(skill_rows)}")

skills_raw = {}
for row in skill_rows:
    uri = row.get('conceptUri', '').strip()
    if not uri:
        continue
    skills_raw[uri] = {
        "esco_id": uri,
        "preferred_label": row.get('preferredLabel', '').strip(),
        "alt_labels": clean_alt_labels(row.get('altLabels', '')),
        "description": (row.get('description', '') or row.get('definition', '') or '').strip(),
        "skill_type": row.get('skillType', '').strip(),
        "scope": (row.get('scopeNote', '') or '').strip(),
    }

# ── Step 4: Parse Occupation-Skill Relations ──
print("Parsing occupation-skill relations...")
rel_rows = parse_csv_file(os.path.join(DATA_DIR, 'occupationSkillRelations_en.csv'))
print(f"  Total relations in CSV: {len(rel_rows)}")

# Map skills to occupations
occ_essential_skills = {}
occ_optional_skills = {}
skill_set = set()

for row in rel_rows:
    occ_uri = row.get('occupationUri', '').strip()
    skill_uri = row.get('skillUri', '').strip()
    relation = row.get('relationType', '').strip()
    
    if not occ_uri or not skill_uri:
        continue
    
    skill_label = row.get('skillLabel', '').strip()
    skill_set.add(skill_uri)
    
    if relation == 'essential':
        occ_essential_skills.setdefault(occ_uri, []).append(skill_label or skill_uri)
    elif relation == 'optional':
        occ_optional_skills.setdefault(occ_uri, []).append(skill_label or skill_uri)

print(f"  Unique skills referenced in relations: {len(skill_set)}")

# ── Step 5: Filter for university-eligible occupations ──
print("Filtering for university-eligible occupations...")
university_occupations = []
all_occupations = []

for uri, occ in occupations_raw.items():
    isco_code = occ['isco_code']
    major_group = get_isco_major_group(isco_code) if isco_code else 0
    
    occ_entry = {
        "esco_id": occ['esco_id'],
        "preferred_label": occ['preferred_label'],
        "alt_labels": occ['alt_labels'],
        "description": occ['description'],
        "isco_code": isco_code,
        "isco_level": major_group,
        "essential_skills": occ_essential_skills.get(uri, []),
        "optional_skills": occ_optional_skills.get(uri, []),
    }
    all_occupations.append(occ_entry)
    
    if is_university_eligible(isco_code):
        university_occupations.append(occ_entry)

print(f"  University-eligible occupations: {len(university_occupations)} / {len(all_occupations)}")

# ── Step 6: Build skills list (all skills from CSV) ──
skills_list = list(skills_raw.values())

# ── Step 7: Compute stats ──
total_mappings = sum(
    len(occ_essential_skills.get(uri, [])) + len(occ_optional_skills.get(uri, []))
    for uri in occupations_raw
)

stats = {
    "total_occupations": len(all_occupations),
    "university_level_occupations": len(university_occupations),
    "total_skills": len(skills_list),
    "occupation_skill_mappings": total_mappings,
}

print(f"\nStats: {json.dumps(stats, indent=2)}")

# ── Step 8: Write output ──
output = {
    "occupations": university_occupations,
    "skills": skills_list,
    "isco_hierarchy": isco_hierarchy,
    "stats": stats,
}

print(f"\nWriting output to {OUTPUT_FILE}...")
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("Done.")
