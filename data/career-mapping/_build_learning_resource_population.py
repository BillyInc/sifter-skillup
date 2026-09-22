#!/usr/bin/env python3
"""Build the source-backed career learning-resource population.

This creates JSON and an audit report only. It deliberately does not emit SQL.
The generated records point learners to source material, learning providers,
professional bodies, exams, and tool documentation while preserving the
difference between a regulator, an association, a learning provider, and a
global occupation proxy.
"""

from __future__ import annotations

import csv
import json
import os
import re
import uuid
from collections import Counter, defaultdict
from urllib.parse import quote_plus

from _learning_resource_population_io import write_population
from _role_tools_loader import load_role_tools

HERE = os.path.dirname(os.path.abspath(__file__))
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")


def load(name: str):
    with open(os.path.join(HERE, name), encoding="utf-8") as handle:
        return json.load(handle)


def uid(*parts: object) -> str:
    return str(uuid.uuid5(NS, "|".join(str(part) for part in parts)))


def clean(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def split_skills(value: object) -> list[str]:
    if isinstance(value, list):
        return [clean(item) for item in value if clean(item) and clean(item).lower() != "nan"]
    return [part.strip() for part in re.split(r"\s*[|;]\s*", clean(value)) if part.strip()]


def valid_url(value: object) -> bool:
    return isinstance(value, str) and value.startswith("https://")


catalog = load("learning_resource_catalog.json")
providers = catalog["providers"]
source_audit = load("domain_skill_competency_certification_audit.json")
web_source_audit = load("nigerian_web_source_evidence_audit.json")
domain_structure = load("domain_structure.json")
roles = load("role_library_v3_cleaned.json")
try:
    from _role_overlay_loader import load_overlay_roles

    roles.extend(load_overlay_roles())
except ImportError:
    pass
domain_tools = load("domain_tools.json")
role_tools = load_role_tools()
body_audit = load("nigerian_professional_body_audit.json")
remaining_body_evidence = load("nigerian_remaining_body_web_evidence.json")
cert_enrichment = list(csv.DictReader(open(os.path.join(HERE, "_enrichment", "certs_enrichment.csv"), encoding="utf-8")))
tool_enrichment = list(csv.DictReader(open(os.path.join(HERE, "_enrichment", "tools_demand.csv"), encoding="utf-8")))
skill_uri_rows = list(csv.DictReader(open(os.path.join(HERE, "_enrichment", "skills_uris.csv"), encoding="utf-8")))

audited_domains = {row["domain_id"]: row for row in source_audit["domains"]}
domain_keys = set(audited_domains)
audited_domain_uuids = {domain_id: uid("domain", domain_id) for domain_id in domain_keys}
body_catalog = {row["body_id"]: row for row in body_audit["body_catalog"]}
verified_web_sources = web_source_audit.get("verified_sources", [])
web_sources_by_body: dict[str, list[dict]] = defaultdict(list)
for web_source in verified_web_sources:
    for body_id in web_source.get("covered_body_ids", []):
        web_sources_by_body[clean(body_id)].append(web_source)
reviewed_body_ids = {row["body_id"] for row in remaining_body_evidence["records"]}
known_subgroup_keys = {
    domain_id: {
        clean(subgroup.get("isco_submajor"))
        for subgroup in (domain_structure.get(domain_id, {}).get("subgroups") or [])
        if clean(subgroup.get("isco_submajor"))
    }
    for domain_id in domain_keys
}


def subgroup_uuid_for_role(domain_id: str, role: dict) -> str | None:
    """Return a subgroup FK only when the taxonomy actually defines it.

    Some source roles carry an ISCO sub-major even when the current taxonomy
    intentionally keeps that domain flat.  Emitting a synthetic subgroup UUID
    creates resource rows that cannot satisfy the career seed's FK contract.
    """
    subgroup_key = clean(str(role.get("isco_group"))[:2]) if role.get("isco_group") else ""
    if not subgroup_key or subgroup_key not in known_subgroup_keys.get(domain_id, set()):
        return None
    return uid("subgroup", domain_id, subgroup_key)


tool_urls = {clean(key).casefold(): value for key, value in catalog.get("tool_urls", {}).items()}
# O*NET and specialist overlays contain tools that are not in the small
# enrichment CSV. Keep these exact official destinations here rather than
# emitting invented search URLs.
tool_urls.update({
    "j2ee": "https://jakarta.ee/specifications/platform/",
    "spring boot": "https://spring.io/projects/spring-boot",
    "gitlab": "https://docs.gitlab.com/",
    "vue.js": "https://vuejs.org/guide/introduction.html",
    "restful api": "https://developer.mozilla.org/en-US/docs/Glossary/REST",
    "openshift": "https://docs.openshift.com/",
    "angular": "https://angular.dev/overview",
    "hibernate": "https://hibernate.org/orm/documentation/",
    "tfs": "https://learn.microsoft.com/azure/devops/",
    "db2": "https://www.ibm.com/docs/en/db2",
    "google sheets": "https://support.google.com/a/users/answer/9282959",
    "aws cloudformation": "https://docs.aws.amazon.com/cloudformation/",
    "bootstrap": "https://getbootstrap.com/docs/",
    "ssis": "https://learn.microsoft.com/sql/integration-services/",
    "asp.net": "https://dotnet.microsoft.com/en-us/apps/aspnet",
    "bitbucket": "https://support.atlassian.com/bitbucket-cloud/",
    "graphql": "https://graphql.org/learn/",
    "node.js": "https://nodejs.org/docs/latest/api/",
    "postgresql": "https://www.postgresql.org/docs/",
    "c++": "https://en.cppreference.com/w/",
    "matlab": "https://www.mathworks.com/learn/tutorials.html",
    "blender": "https://www.blender.org/support/tutorials/",
    "unity": "https://learn.unity.com/",
    "unreal engine": "https://dev.epicgames.com/documentation/en-us/unreal-engine",
    "jira": "https://www.atlassian.com/software/jira/guides",
    "autocad": "https://www.autodesk.com/learn/ondemand",
    "revit": "https://www.autodesk.com/learn/ondemand/collection/learn-revit",
    "solidworks": "https://my.solidworks.com/training",
    "sketchup": "https://learn.sketchup.com/",
    "microsoft excel": "https://support.microsoft.com/excel",
    "microsoft office": "https://support.microsoft.com/office",
    "microsoft powerpoint": "https://support.microsoft.com/powerpoint",
    "microsoft word": "https://support.microsoft.com/word",
    "microsoft outlook": "https://support.microsoft.com/outlook",
    "microsoft access": "https://support.microsoft.com/access",
    "microsoft windows": "https://learn.microsoft.com/windows/",
    "microsoft sharepoint": "https://support.microsoft.com/sharepoint",
    "microsoft project": "https://support.microsoft.com/project",
    "microsoft visio": "https://support.microsoft.com/visio",
    "microsoft visual studio": "https://learn.microsoft.com/visualstudio/",
    "microsoft visual basic": "https://learn.microsoft.com/dotnet/visual-basic/",
    "microsoft power bi": "https://learn.microsoft.com/power-bi/",
    "microsoft power automate": "https://learn.microsoft.com/power-automate/",
    "microsoft power platform": "https://learn.microsoft.com/power-platform/",
    "microsoft teams": "https://support.microsoft.com/teams",
    "microsoft azure": "https://learn.microsoft.com/azure/",
    "microsoft sql server": "https://learn.microsoft.com/sql/",
    "microsoft active directory": "https://learn.microsoft.com/windows-server/identity/ad-ds/",
    "microsoft windows server": "https://learn.microsoft.com/windows-server/",
    "microsoft powershell": "https://learn.microsoft.com/powershell/",
    "microsoft internet information services": "https://learn.microsoft.com/iis/",
    "microsoft edge": "https://learn.microsoft.com/microsoft-edge/",
    "adobe acrobat": "https://helpx.adobe.com/acrobat/tutorials.html",
    "adobe photoshop": "https://helpx.adobe.com/photoshop/tutorials.html",
    "adobe illustrator": "https://helpx.adobe.com/illustrator/tutorials.html",
    "adobe indesign": "https://helpx.adobe.com/indesign/tutorials.html",
    "adobe creative cloud": "https://helpx.adobe.com/creative-cloud/tutorials-explore.html",
    "adobe after effects": "https://helpx.adobe.com/after-effects/tutorials.html",
    "adobe premiere pro": "https://helpx.adobe.com/premiere-pro/tutorials.html",
    "adobe photoshop lightroom": "https://helpx.adobe.com/lightroom-cc/tutorials.html",
    "adobe analytics": "https://experienceleague.adobe.com/en/docs/analytics-learn/tutorials/overview",
    "oracle peoplesoft": "https://docs.oracle.com/en/applications/peoplesoft/",
    "oracle primavera": "https://docs.oracle.com/en/industries/construction-engineering/primavera-p6/",
    "oracle sql developer": "https://www.oracle.com/database/sqldeveloper/",
    "oracle database": "https://docs.oracle.com/en/database/",
    "oracle java": "https://dev.java/learn/",
    "sap software": "https://learning.sap.com/",
    "sap concur": "https://www.concur.com/en-us/resource-center",
    "google analytics": "https://analytics.google.com/analytics/academy/",
    "google workspace": "https://support.google.com/a/users/",
    "google docs": "https://support.google.com/docs/",
    "google sheets": "https://support.google.com/docs/",
    "google ads": "https://skillshop.withgoogle.com/googleads",
    "google tag manager": "https://support.google.com/tagmanager/",
    "google android": "https://developer.android.com/learn",
    "google meet": "https://support.google.com/meet/",
    "atlassian jira": "https://www.atlassian.com/software/jira/guides",
    "atlassian confluence": "https://www.atlassian.com/software/confluence/guides",
    "atlassian bitbucket": "https://support.atlassian.com/bitbucket-cloud/",
    "esri arcgis": "https://learn.arcgis.com/en/",
    "esri arcgis arcpy": "https://pro.arcgis.com/en/pro-app/latest/arcpy/main/",
    "esri arcgis survey": "https://doc.arcgis.com/en/survey123/",
    "qgis": "https://docs.qgis.org/latest/en/docs/training_manual/",
    "bentley microstation": "https://learn.bentley.com/app/Public/ViewLearningPathWithCertificationsExpanded.action",
    "autodesk autocad": "https://www.autodesk.com/learn/ondemand/collection/learn-autocad",
    "autodesk autocad civil 3d": "https://www.autodesk.com/learn/ondemand/collection/learn-civil-3d",
    "autodesk revit": "https://www.autodesk.com/learn/ondemand/collection/learn-revit",
    "autodesk navisworks": "https://www.autodesk.com/learn/ondemand/collection/learn-navisworks",
    "autodesk maya": "https://www.autodesk.com/learn/ondemand/collection/learn-maya",
    "autodesk 3ds max": "https://www.autodesk.com/learn/ondemand/collection/learn-3ds-max",
    "dassault systemes solidworks": "https://my.solidworks.com/training",
    "dassault systemes catia": "https://www.3ds.com/edu/education/students/solutions/catia",
    "ptc creo": "https://www.ptc.com/en/technologies/cad/creo",
    "the mathworks matlab": "https://www.mathworks.com/learn/tutorials.html",
    "mathworks simulink": "https://www.mathworks.com/learn/tutorials/simulink.html",
    "national instruments labview": "https://www.ni.com/docs/en-US/bundle/labview/",
    "python": "https://docs.python.org/3/tutorial/",
    "r language": "https://cran.r-project.org/manuals.html",
    "php": "https://www.php.net/manual/en/",
    "ruby": "https://www.ruby-lang.org/en/documentation/quickstart/",
    "perl": "https://perldoc.perl.org/",
    "go": "https://go.dev/learn/",
    "rust programming language": "https://www.rust-lang.org/learn",
    "swift": "https://www.swift.org/getting-started/",
    "scala": "https://docs.scala-lang.org/",
    "c++": "https://en.cppreference.com/w/",
    "c#": "https://learn.microsoft.com/dotnet/csharp/",
    "structured query language": "https://www.w3schools.com/sql/",
    "transact-sql": "https://learn.microsoft.com/sql/t-sql/",
    "apache spark": "https://spark.apache.org/docs/latest/",
    "apache hadoop": "https://hadoop.apache.org/docs/",
    "apache hive": "https://hive.apache.org/",
    "apache kafka": "https://kafka.apache.org/documentation/",
    "apache cassandra": "https://cassandra.apache.org/doc/latest/",
    "apache airflow": "https://airflow.apache.org/docs/",
    "apache maven": "https://maven.apache.org/guides/",
    "apache tomcat": "https://tomcat.apache.org/tomcat-11.0-doc/",
    "mysql": "https://dev.mysql.com/doc/",
    "postgresql": "https://www.postgresql.org/docs/",
    "mongodb": "https://www.mongodb.com/docs/",
    "redis": "https://redis.io/docs/latest/",
    "ibm db2": "https://www.ibm.com/docs/en/db2",
    "amazon redshift": "https://docs.aws.amazon.com/redshift/",
    "amazon dynamodb": "https://docs.aws.amazon.com/dynamodb/",
    "snowflake": "https://docs.snowflake.com/",
    "pandas": "https://pandas.pydata.org/docs/",
    "numpy": "https://numpy.org/learn/",
    "scikit-learn": "https://scikit-learn.org/stable/user_guide.html",
    "tensorflow": "https://www.tensorflow.org/learn",
    "pytorch": "https://pytorch.org/tutorials/",
    "sas": "https://support.sas.com/learn/",
    "ibm spss": "https://www.ibm.com/products/spss-statistics/learn",
    "tableau": "https://www.tableau.com/learn/training",
    "stata": "https://www.stata.com/learn/",
    "alteryx": "https://community.alteryx.com/t5/Alteryx-Designer-Desktop/ct-p/alteryx-designer",
    "salesforce": "https://trailhead.salesforce.com/",
    "hubspot": "https://academy.hubspot.com/",
    "marketo": "https://experienceleague.adobe.com/en/docs/marketo/using/home",
    "servicenow": "https://www.servicenow.com/community/now-learning/ct-p/now-learning",
    "workday": "https://www.workday.com/en-us/company/education-and-training.html",
    "zoom": "https://support.zoom.com/hc/en/",
    "slack": "https://slack.com/help/categories/200111606",
    "cisco webex": "https://help.webex.com/en-us/",
    "figma": "https://help.figma.com/hc/en-us/categories/360002051613-Learn-design",
    "canva": "https://www.canva.com/designschool/",
    "adobe xd": "https://helpx.adobe.com/xd/tutorials.html",
    "invision": "https://support.invisionapp.com/hc/en-us",
    "blender": "https://www.blender.org/support/tutorials/",
    "unity technologies unity": "https://learn.unity.com/",
    "unreal technology unreal engine": "https://dev.epicgames.com/documentation/en-us/unreal-engine",
    "maxon cinema 4d": "https://www.maxon.net/en/learn",
    "sidefx houdini": "https://www.sidefx.com/learn/",
    "davinci resolve": "https://www.blackmagicdesign.com/products/davinciresolve/training",
    "apple final cut pro": "https://support.apple.com/final-cut-pro",
    "techsmith camtasia": "https://www.techsmith.com/learn/camtasia/",
    "zoom": "https://support.zoom.com/hc/en/",
    "metasploit": "https://docs.metasploit.com/",
    "nmap": "https://nmap.org/book/",
    "portswigger burp suite": "https://portswigger.net/web-security",
    "mitre att&ck": "https://attack.mitre.org/",
    "kali linux": "https://www.kali.org/docs/",
    "splunk": "https://education.splunk.com/",
    "qualys": "https://www.qualys.com/training/",
    "tenable nessus": "https://docs.tenable.com/nessus/",
    "github": "https://docs.github.com/",
    "gitlab": "https://docs.gitlab.com/",
    "wordpress": "https://learn.wordpress.org/",
    "drupal": "https://www.drupal.org/docs",
    "semrush": "https://www.semrush.com/academy/",
    "moz": "https://moz.com/learn/seo",
    "ahrefs": "https://ahrefs.com/academy",
    "screaming frog": "https://www.screamingfrog.co.uk/seo-spider/user-guide/",
    "westlaw": "https://legal.thomsonreuters.com/en/westlaw",
    "redcap": "https://projectredcap.org/resources/",
    "qualtrics": "https://www.qualtrics.com/support/",
    "epic systems": "https://www.epic.com/software",
    "meditech": "https://ehr.meditech.com/",
    "eclinicalworks": "https://www.eclinicalworks.com/resources/",
    "henry schein dentrix": "https://www.dentrix.com/resources/",
    "asana": "https://academy.asana.com/",
    "pmi": "https://www.pmi.org/learning",
    "procore": "https://learn.procore.com/",
    "yardi": "https://www.yardi.com/resources/",
    "quickbooks": "https://quickbooks.intuit.com/learn-support/",
    "intuit turbotax": "https://turbotax.intuit.com/tax-tips/",
    "amadeus": "https://amadeus.com/en/learn",
    "sabre": "https://www.sabre.com/insights/",
})
tool_enrichment_by_name = {
    clean(row.get("tool_name")).casefold(): row
    for row in tool_enrichment
    if clean(row.get("tool_name")) and valid_url(row.get("tool_url"))
}
skill_uri_by_name: dict[str, str] = {}
for row in skill_uri_rows:
    skill = clean(row.get("skill_name")).casefold()
    uri = clean(row.get("uri"))
    if skill and uri and valid_url(uri) and skill not in skill_uri_by_name:
        skill_uri_by_name[skill] = uri

cert_enrichment_by_key = {
    (clean(row.get("domain_key")), clean(row.get("cert_name")).casefold()): row
    for row in cert_enrichment
    if clean(row.get("domain_key")) and clean(row.get("cert_name"))
}

cert_provider_urls = {
    "aws": "https://aws.amazon.com/certification/",
    "microsoft": "https://learn.microsoft.com/credentials/",
    "azure": "https://learn.microsoft.com/credentials/",
    "google": "https://cloud.google.com/learn/certification",
    "cisco": "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/index.html",
    "comptia": "https://www.comptia.org/certifications",
    "pmi": "https://www.pmi.org/certifications",
    "cfa": "https://www.cfainstitute.org/programs/cfa-program",
    "frm": "https://www.garp.org/frm",
    "kubernetes": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/",
    "ican": "https://www.icanig.org/",
    "cibn": "https://www.cibng.org/",
    "cipm": "https://cipmnigeria.org/",
    "citn": "https://portal.citn.org/examination-syllabus/",
}


def web_sources_for_domain(domain_row: dict) -> list[dict]:
    evidence = domain_row.get("nigerian_web_evidence") or {}
    body_ids = {clean(body_id) for body_id in evidence.get("body_ids", []) if clean(body_id)}
    selected: list[dict] = []
    seen: set[str] = set()
    for source in verified_web_sources:
        source_id = clean(source.get("source_id"))
        if source_id and source_id in seen:
            continue
        if body_ids.intersection(clean(body_id) for body_id in source.get("covered_body_ids", [])):
            selected.append(source)
            seen.add(source_id)
    return selected


def source_for_evidence(domain_row: dict, text: str, field: str | None = None) -> dict | None:
    haystack = clean(text).casefold()
    candidates = web_sources_for_domain(domain_row)
    if field:
        scored: list[tuple[int, dict]] = []
        terms = {term for term in re.findall(r"[a-z0-9]+", haystack) if len(term) > 3}
        for source in candidates:
            source_text = " ".join(clean(value) for value in source.get(field, []))
            source_terms = {term for term in re.findall(r"[a-z0-9]+", source_text.casefold()) if len(term) > 3}
            score = len(terms.intersection(source_terms))
            if haystack and haystack in source_text.casefold():
                score += 5
            if score:
                scored.append((score, source))
        if scored:
            return max(scored, key=lambda item: item[0])[1]
    return candidates[0] if candidates else None


def source_url_for_domain(domain_row: dict, text: str = "") -> tuple[str | None, str, str, dict]:
    source = source_for_evidence(domain_row, text, "competencies" if text else None)
    if source and valid_url(source.get("url")):
        return (
            clean(source.get("url")),
            clean(source.get("name")) or "Nigerian source",
            "source_backed",
            {"source_id": source.get("source_id"), "source_class": source.get("source_class")},
        )
    for body in domain_row.get("nigerian_bodies", []):
        if valid_url(body.get("url")):
            return (
                clean(body.get("url")),
                clean(body.get("name")) or "Nigerian body",
                "limited",
                {"body_id": body.get("body_id"), "body_type": body.get("body_type")},
            )
    return None, "Nigerian source", "limited", {}


def provider_ids_for(text: str) -> list[str]:
    haystack = clean(text).casefold()
    selected: list[str] = []
    for route in catalog.get("keyword_routes", []):
        if any(clean(keyword).casefold() in haystack for keyword in route.get("keywords", [])):
            for provider_id in route.get("providers", []):
                if provider_id not in selected:
                    selected.append(provider_id)
    if not selected:
        selected = ["mit_ocw", "coursera"]
    return selected[:4]


def skill_url(skill: str) -> str:
    return skill_uri_by_name.get(clean(skill).casefold()) or (
        "https://esco.ec.europa.eu/en/use-esco?text=" + quote_plus(clean(skill))
    )


def provider_url_for_tool(tool: str) -> str | None:
    name = clean(tool).casefold()
    exact = tool_urls.get(name)
    if exact:
        return exact
    for key in sorted(tool_urls, key=len, reverse=True):
        url = tool_urls[key]
        if len(key) < 4:
            continue
        if key in name or name in key:
            return url
    row = tool_enrichment_by_name.get(name)
    if row:
        return clean(row.get("tool_url")) or None
    return None


def certification_url(cert_name: str, body_name: str, domain_row: dict) -> tuple[str | None, str, str]:
    key = (clean(domain_row.get("domain_id")), clean(cert_name).casefold())
    enriched = cert_enrichment_by_key.get(key)
    if enriched and valid_url(enriched.get("official_url")):
        return clean(enriched["official_url"]), clean(enriched.get("cert_body")) or body_name, "source_backed"
    source = source_for_evidence(domain_row, cert_name, "certifications")
    if source and valid_url(source.get("url")):
        source_text = " ".join(clean(value) for value in source.get("certifications", [])).casefold()
        cert_text = clean(cert_name).casefold()
        cert_terms = {term for term in re.findall(r"[a-z0-9]+", cert_text) if len(term) > 3}
        source_terms = {term for term in re.findall(r"[a-z0-9]+", source_text) if len(term) > 3}
        if cert_text in source_text or len(cert_terms.intersection(source_terms)) >= 2:
            return clean(source["url"]), clean(source.get("name")) or body_name, "source_backed"
    haystack = f"{cert_name} {body_name}".casefold()
    for marker, url in cert_provider_urls.items():
        if marker in haystack:
            return url, body_name or marker.upper(), "partial"
    for body in domain_row.get("nigerian_bodies", []):
        body_name_text = clean(body.get("name"))
        if body_name_text and (body_name_text.casefold() in haystack or haystack in body_name_text.casefold()):
            return clean(body.get("url")), body_name_text, "source_backed"
    bodies = domain_row.get("nigerian_bodies", [])
    if bodies and valid_url(bodies[0].get("url")):
        return clean(bodies[0]["url"]), clean(bodies[0].get("name")), "limited"
    return None, body_name, "limited"


resources: dict[tuple, dict] = {}


def add_resource(
    *,
    domain_id: str | None,
    subgroup_id: str | None,
    role_id: str | None,
    resource_type: str,
    target_name: str,
    provider: str,
    region: str,
    access_type: str,
    delivery: str | None,
    url: str | None,
    description: str | None,
    source_url: str | None = None,
    source_confidence: str = "medium",
    data_state: str = "source_backed",
    price: float | None = None,
    currency: str | None = None,
    price_period: str | None = None,
    price_as_of: str | None = None,
    price_source: str | None = None,
    provenance: dict | None = None,
) -> None:
    if not target_name or not provider or not valid_url(url):
        return
    if price is not None and (not price_source or not price_as_of):
        raise ValueError(f"Fixed price without dated source: {provider} / {target_name}")
    key = (domain_id, subgroup_id, role_id, resource_type, target_name, provider, url)
    resources[key] = {
        "id": uid("career_resource", *key),
        "domain_id": domain_id,
        "subgroup_id": subgroup_id,
        "role_id": role_id,
        "resource_type": resource_type,
        "target_name": target_name,
        "provider": provider,
        "region": region,
        "access_type": access_type,
        "delivery": delivery,
        "url": url,
        "price": price,
        "currency": currency,
        "price_period": price_period,
        "price_as_of": price_as_of,
        "price_source": price_source,
        "source_url": source_url or url,
        "description": description,
        "source_confidence": source_confidence,
        "data_state": data_state,
        "source_provenance": provenance or {},
    }


def add_provider_resource(domain_id: str, target: str, resource_type: str, provider_id: str, scope_id: str | None = None, role_id: str | None = None, subgroup_id: str | None = None) -> None:
    provider = providers[provider_id]
    add_resource(
        domain_id=domain_id,
        subgroup_id=subgroup_id,
        role_id=role_id,
        resource_type=resource_type,
        target_name=target,
        provider=provider["name"],
        region=provider["region"],
        access_type=provider["access_type"],
        delivery=provider.get("delivery"),
        url=provider["url"],
        description=provider.get("description"),
        source_url=provider.get("price_source") or provider["url"],
        source_confidence="high",
        data_state="source_backed" if provider["access_type"] != "dynamic" else "dynamic",
        price=provider.get("price"),
        currency=provider.get("currency"),
        price_period=provider.get("price_period"),
        price_as_of=provider.get("price_as_of"),
        price_source=provider.get("price_source"),
        provenance={"catalog_provider_id": provider_id, "catalog_as_of": catalog.get("as_of")},
    )


roles_by_domain: dict[str, list[dict]] = defaultdict(list)
for role in roles:
    domain_id = clean(role.get("domain_id"))
    if domain_id in domain_keys:
        roles_by_domain[domain_id].append(role)

for domain_id, domain_row in audited_domains.items():
    domain_uuid = uid("domain", domain_id)
    domain_name = clean(domain_row.get("domain_name"))
    structure = domain_structure.get(domain_id, {})

    # Local body pages are useful directly, but their evidence class remains
    # visible so an association is not presented as a statutory licence.
    for body in domain_row.get("nigerian_bodies", []):
        body_id = clean(body.get("body_id"))
        body_name = clean(body.get("name"))
        body_url = clean(body.get("url"))
        body_type = clean(body.get("body_type"))
        if not body_name or not valid_url(body_url):
            continue
        detailed = body_id in reviewed_body_ids
        add_resource(
            domain_id=domain_uuid,
            subgroup_id=None,
            role_id=None,
            resource_type="professional_body",
            target_name=body_name,
            provider=body_name,
            region="nigeria",
            access_type="dynamic",
            delivery="official website",
            url=body_url,
            description=(
                "Official Nigerian professional or sector source. Check the source for the exact roles, training, exam or registration details."
                if detailed else
                "Nigerian body or agency context. This link is not, by itself, proof of a licence or role competency."
            ),
            source_url=body_url,
            source_confidence="high" if detailed else "medium",
            data_state="source_backed" if detailed else "limited",
            provenance={"body_id": body_id, "body_type": body_type, "evidence_reviewed": detailed},
        )

    # Global occupation and domain references give the student a destination
    # for understanding the field without converting proxy data into Nigerian demand.
    for source in domain_row.get("global_sources", []):
        add_resource(
            domain_id=domain_uuid,
            subgroup_id=None,
            role_id=None,
            resource_type="domain_overview",
            target_name=domain_name,
            provider=clean(source.get("name")),
            region=clean(source.get("region")) or "global",
            access_type="free",
            delivery="public reference",
            url=clean(source.get("url")),
            description="Reference material for understanding this field. Global proxy sources are not Nigerian demand data.",
            source_url=clean(source.get("url")),
            source_confidence="high",
            data_state="source_backed",
            provenance={"source_id": source.get("source_id"), "evidence_type": source.get("evidence_type")},
        )

    # Nigerian web and overlay competencies are attached to the source page
    # that names the competency. A body homepage is a limited fallback only.
    overlay = domain_row.get("nigerian_overlay_evidence") or {}
    web_evidence = domain_row.get("nigerian_web_evidence") or {}
    competencies = list(dict.fromkeys(
        [clean(value) for value in web_evidence.get("competencies", []) if clean(value)]
        + [clean(value) for value in overlay.get("competencies", []) if clean(value)]
    ))
    for competency in competencies:
        url, provider, state, provenance = source_url_for_domain(domain_row, competency)
        if not url:
            continue
        add_resource(
            domain_id=domain_uuid,
            subgroup_id=None,
            role_id=None,
            resource_type="competency_reference",
            target_name=competency,
            provider=provider,
            region="nigeria",
            access_type="dynamic",
            delivery="official reference",
            url=url,
            description="Open the source to understand this competency and any applicable training, examination or practice requirements.",
            source_url=url,
            source_confidence="high" if state == "source_backed" else "medium",
            data_state=state,
            provenance={**provenance, "domain_evidence_class": domain_row.get("nigerian_evidence_class")},
        )

    for provider_id in provider_ids_for(domain_name):
        add_provider_resource(domain_uuid, f"Skills used in {domain_name}", "skill_learning", provider_id)

    for skill in (structure.get("foundation_skills") or []):
        skill_name = clean(skill.get("skill") if isinstance(skill, dict) else skill)
        if not skill_name or skill_name.casefold() == "nan":
            continue
        reference = skill_url(skill_name)
        add_resource(
            domain_id=domain_uuid,
            subgroup_id=None,
            role_id=None,
            resource_type="skill_reference",
            target_name=skill_name,
            provider="ESCO skill reference",
            region="global",
            access_type="free",
            delivery="public reference",
            url=reference,
            description="Reference description for this skill; a reference does not prove learner competence.",
            source_url="https://esco.ec.europa.eu/en/use-esco",
            source_confidence="high",
            data_state="source_backed",
            provenance={"source": "esco", "exact_uri": reference in skill_uri_by_name.values()},
        )
        for provider_id in provider_ids_for(f"{domain_name} {skill_name}")[:1]:
            add_provider_resource(domain_uuid, skill_name, "skill_learning", provider_id)

    # Domain-scoped tools retain their source and add a directly usable
    # documentation or learning destination where one is known.
    tool_groups = domain_tools.get(domain_id, {})
    for group_key, tool_group in (("distinctive", "distinctive_tools"), ("common", "common_tools")):
        for tool in tool_groups.get(tool_group, []):
            tool_name = clean(tool.get("tool"))
            if not tool_name:
                continue
            exact_url = provider_url_for_tool(tool_name)
            if exact_url:
                add_resource(
                    domain_id=domain_uuid,
                    subgroup_id=None,
                    role_id=None,
                    resource_type="tool_learning",
                    target_name=tool_name,
                    provider="Tool documentation or learning",
                    region="global",
                    access_type="free",
                    delivery="official documentation or tutorial",
                    url=exact_url,
                    description="Open the documentation or tutorial for this tool.",
                    source_url=exact_url,
                    source_confidence=clean(tool.get("source_confidence")) or "medium",
                    data_state=clean(tool.get("data_state")) or "partial",
                    provenance=tool.get("provenance") or {},
                )

    # Domain and subgroup certifications retain their placement. The link is
    # exact when enrichment has it, otherwise it leads to the named body or
    # provider with an explicit limited state.
    cert_rows = list((structure.get("gateway_certifications") or []) + (structure.get("role_hint_certifications") or []))
    known_cert_names = {clean(cert.get("name")).casefold() for cert in cert_rows if clean(cert.get("name"))}
    # Preserve named Nigerian certification and registration signals from the
    # internet evidence even when the normalized structure has no gateway row.
    for cert_name in list(web_evidence.get("certifications", [])) + list(overlay.get("certifications", [])):
        cert_name = clean(cert_name)
        if not cert_name or cert_name.casefold() in known_cert_names:
            continue
        cert_rows.append({
            "name": cert_name,
            "body": "Nigerian source or professional body",
            "region": "nigeria",
            "placement": "nigerian_web_evidence",
            "gate_reason": "named by source audit",
        })
        known_cert_names.add(cert_name.casefold())
    for subgroup in structure.get("subgroups") or []:
        subgroup_key = clean(subgroup.get("isco_submajor"))
        subgroup_uuid = uid("subgroup", domain_id, subgroup_key)
        for skill in subgroup.get("cluster_skills") or []:
            skill_name = clean(skill)
            if not skill_name:
                continue
            add_resource(
                domain_id=domain_uuid,
                subgroup_id=subgroup_uuid,
                role_id=None,
                resource_type="skill_reference",
                target_name=skill_name,
                provider="ESCO skill reference",
                region="global",
                access_type="free",
                delivery="public reference",
                url=skill_url(skill_name),
                description="Reference description for this subgroup skill.",
                source_url="https://esco.ec.europa.eu/en/use-esco",
                source_confidence="high",
                data_state="source_backed",
                provenance={"source": "esco", "scope": "subgroup"},
            )
            for provider_id in provider_ids_for(f"{domain_name} {skill_name}")[:1]:
                add_provider_resource(domain_uuid, skill_name, "skill_learning", provider_id, subgroup_id=subgroup_uuid)

    for cert in cert_rows:
        cert_name = clean(cert.get("name"))
        if not cert_name:
            continue
        url, provider_name, state = certification_url(cert_name, clean(cert.get("body")), domain_row)
        enriched = cert_enrichment_by_key.get((domain_id, cert_name.casefold())) or {}
        add_resource(
            domain_id=domain_uuid,
            subgroup_id=None,
            role_id=None,
            resource_type="certification_exam",
            target_name=cert_name,
            provider=provider_name or clean(cert.get("body")) or "Certification provider",
            region="nigeria" if clean(cert.get("region")) == "nigeria" else "global",
            access_type="dynamic",
            delivery="official exam or registration information",
            url=url,
            description="Check the provider for eligibility, exam dates, registration and current fees.",
            source_url=url,
            source_confidence="high" if state == "source_backed" else "medium",
            data_state=state,
            price=float(enriched["price"]) if clean(enriched.get("price")) else None,
            currency=clean(enriched.get("currency")) or None,
            price_period=clean(enriched.get("price_period")) or None,
            price_as_of=clean(enriched.get("price_as_of")) or None,
            price_source=clean(enriched.get("price_source")) or None,
            provenance={"placement": cert.get("placement"), "gate_reason": cert.get("gate_reason")},
        )

for domain_id, domain_roles in roles_by_domain.items():
    domain_uuid = uid("domain", domain_id)
    domain_name = clean(audited_domains[domain_id].get("domain_name"))
    for role in domain_roles:
        role_key = f"{domain_id}|{clean(role.get('role_name'))}"
        role_uuid = uid("role", role_key)
        source = clean(role.get("source")).casefold()
        if source == "onet":
            role_url = "https://www.onetonline.org/find/quick?s=" + quote_plus(clean(role.get("role_name")))
            role_provider = "O*NET"
            role_region = "global_proxy"
        else:
            role_url = "https://esco.ec.europa.eu/en/classification/occupation?text=" + quote_plus(clean(role.get("role_name")))
            role_provider = "ESCO"
            role_region = "global"
        add_resource(
            domain_id=domain_uuid,
            subgroup_id=subgroup_uuid_for_role(domain_id, role),
            role_id=role_uuid,
            resource_type="role_reference",
            target_name=clean(role.get("role_name")),
            provider=role_provider,
            region=role_region,
            access_type="free",
            delivery="public occupation reference",
            url=role_url,
            description="Open the role reference to see typical work, tasks and related skills. Global proxy data is not Nigerian demand data.",
            source_url=role_url,
            source_confidence="high",
            data_state="source_backed" if source else "partial",
            provenance={"source": source, "esco_code": role.get("esco_code"), "onet_score": role.get("onet_score")},
        )
        # Keep the population useful and bounded: the role has one guided
        # learning destination, while its individual skills retain their own
        # reference links below.
        for provider_id in provider_ids_for(f"{domain_name} {clean(role.get('role_name'))}")[:1]:
            add_provider_resource(
                domain_uuid,
                f"Learning path for {clean(role.get('role_name'))}",
                "skill_learning",
                provider_id,
                role_id=role_uuid,
            )
        for skill in split_skills(role.get("essential_skills")) + split_skills(role.get("optional_skills")):
            add_resource(
                domain_id=domain_uuid,
                subgroup_id=subgroup_uuid_for_role(domain_id, role),
                role_id=role_uuid,
                resource_type="skill_reference",
                target_name=skill,
                provider="ESCO skill reference",
                region="global",
                access_type="free",
                delivery="public reference",
                url=skill_url(skill),
                description="Reference description for a skill associated with this role; it does not prove mastery.",
                source_url="https://esco.ec.europa.eu/en/use-esco",
                source_confidence="high",
                data_state="source_backed",
                provenance={"source": "esco", "role_key": role_key},
            )

        role_tool_rows = (role_tools.get(role_key) or {}).get("tools", [])
        for tool in role_tool_rows:
            tool_name = clean(tool.get("tool"))
            if not tool_name:
                continue
            url = provider_url_for_tool(tool_name)
            if not url:
                continue
            add_resource(
                domain_id=domain_uuid,
                subgroup_id=subgroup_uuid_for_role(domain_id, role),
                role_id=role_uuid,
                resource_type="tool_learning",
                target_name=tool_name,
                provider="Tool documentation or learning",
                region="global",
                access_type="free",
                delivery="official documentation or tutorial",
                url=url,
                description="Open the documentation or tutorial for a tool associated with this role.",
                source_url=url,
                source_confidence=clean(tool.get("source_confidence")) or "medium",
                data_state=clean(tool.get("data_state")) or "partial",
                provenance={"role_key": role_key, "element_id": tool.get("element_id")},
            )

rows = list(resources.values())
counts = Counter(row["resource_type"] for row in rows)
domains_by_type: dict[str, set[str]] = defaultdict(set)
for row in rows:
    if row.get("domain_id"):
        domains_by_type[row["resource_type"]].add(row["domain_id"])

validation_errors: list[str] = []
for row in rows:
    if not valid_url(row.get("url")):
        validation_errors.append(f"invalid url: {row.get('provider')} / {row.get('target_name')}")
    if row.get("price") is not None and (not row.get("price_source") or not row.get("price_as_of")):
        validation_errors.append(f"undated price: {row.get('provider')} / {row.get('target_name')}")
for domain_id in domain_keys:
    domain_uuid = audited_domain_uuids[domain_id]
    if domain_uuid not in domains_by_type["professional_body"] and domain_uuid not in domains_by_type["domain_overview"]:
        validation_errors.append(f"no overview/body resource: {domain_id}")
    if domain_uuid not in domains_by_type["role_reference"]:
        validation_errors.append(f"no role reference resource: {domain_id}")
    if domain_uuid not in domains_by_type["skill_learning"]:
        validation_errors.append(f"no learning resource: {domain_id}")

output = {
    "schema_version": "1.0.0",
    "generated_on": catalog.get("as_of"),
    "purpose": "Clickable source-backed domain, subgroup, role, skill, competency, certification and learning resources.",
    "sql_regeneration_allowed": None,
    "blocked_reason": "Run validate_career_resource_seed_gate.py for the source and domain reconciliation decision.",
    "coverage": {
        "audited_domains": len(domain_keys),
        "resource_rows": len(rows),
        "resource_types": dict(counts),
        "domains_by_resource_type": {key: len(value) for key, value in domains_by_type.items()},
        "fixed_price_rows": sum(row.get("price") is not None for row in rows),
        "fixed_price_currencies": dict(Counter(row.get("currency") for row in rows if row.get("price") is not None)),
        "dynamic_price_rows": sum(row.get("access_type") == "dynamic" for row in rows),
        "validation_errors": len(validation_errors),
    },
    "resources": rows,
}

population_manifest = write_population(output)

with open(os.path.join(HERE, "LEARNING_RESOURCE_POPULATION_AUDIT.md"), "w", encoding="utf-8") as handle:
    handle.write("# Learning resource population audit\n\n")
    handle.write(f"Generated: {catalog.get('as_of')}\n\n")
    handle.write("SQL regeneration: **SEE CAREER_RESOURCE_SEED_GATE.md** for the source and domain reconciliation decision.\n\n")
    handle.write("## Coverage\n\n")
    handle.write(f"- Audited domains: **{len(domain_keys)}**\n")
    handle.write(f"- Resource rows: **{len(rows)}**\n")
    handle.write(f"- JSON population parts: **{len(population_manifest['parts'])}** (maximum {population_manifest['max_part_bytes']:,} bytes each)\n")
    handle.write(f"- Fixed-price rows with dated source: **{output['coverage']['fixed_price_rows']}**\n")
    handle.write(f"- Dynamic-price rows: **{output['coverage']['dynamic_price_rows']}**\n\n")
    handle.write(f"- Fixed-price currencies: **{output['coverage']['fixed_price_currencies']}**\n\n")
    for resource_type, count in sorted(counts.items()):
        handle.write(f"- `{resource_type}`: {count} rows across {len(domains_by_type[resource_type])} domains\n")
    handle.write("\n## Validation\n\n")
    if validation_errors:
        handle.write(f"Validation errors: **{len(validation_errors)}**\n\n")
        for error in validation_errors[:100]:
            handle.write(f"- {error}\n")
    else:
        handle.write("URL, price-date, and minimum domain-resource checks passed for this generated population.\n")

print(json.dumps({"coverage": output["coverage"], "validation_errors": validation_errors[:20]}, indent=2))
