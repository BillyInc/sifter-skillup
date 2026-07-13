#!/usr/bin/env python3
"""
Orchestrator for all enrichment scripts (Phase 9).
Run after source CSVs are prepared.
Order: certs -> skills_uris -> tools_demand -> roles_currency -> admission (if applicable)
"""
import os
import subprocess
import sys

ENRICHMENT_DIR = os.path.dirname(os.path.abspath(__file__))

SCRIPTS = [
    ("certs_enrich.py", "Certifications enrichment"),
    ("skills_uris.py", "Skills ESCO URIs"),
    ("tools_demand_rerank.py", "Tools demand re-rank"),
    ("roles_currency.py", "Roles currency status"),
]

def run_script(script_name: str, description: str):
    script_path = os.path.join(ENRICHMENT_DIR, script_name)
    if not os.path.exists(script_path):
        print(f"⚠️  {script_name} not found, skipping")
        return False
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run([sys.executable, script_path], check=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ FAILED: {script_name}")
        print(e.stdout)
        print(e.stderr)
        return False

def main():
    print("Phase 9 Enrichment Orchestrator")
    print("="*60)
    
    failed = []
    for script, desc in SCRIPTS:
        if not run_script(script, desc):
            failed.append(script)
    
    print("\n" + "="*60)
    if failed:
        print(f"❌ Some scripts failed: {failed}")
        sys.exit(1)
    else:
        print("✅ All enrichment scripts completed successfully")
        sys.exit(0)


if __name__ == "__main__":
    main()