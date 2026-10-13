"""Apply the evidence-backed domain/area parent-boundary repairs.

This is an idempotent, stable-ID repair.  It changes area labels and scope
text, and leaves role keys intact.  The two dedicated-parent redirects remain
as hidden compatibility records so existing references do not become
orphaned; they are not presented as independent student specializations.
"""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOMAIN_STRUCTURE = ROOT / "domain_structure.json"
SPECIALIZATION_CATALOG = ROOT / "domain_specialization_catalog.json"


REPAIRS = {
    "D027:bioinformatics-and-computational-biomedicine": {
        "old_label": "Bioinformatics and Computational Biomedicine",
        "label": "Biomedical Computational Applications",
        "description": "Apply computational analysis to biomedical questions and interpret the results in a biomedical context. General bioinformatics, omics pipelines, computational-biology methods and bioinformatics infrastructure belong to the dedicated Bioinformatics and Computational Biology domain (D142).",
        "boundary": "A biomedical-science application area for computational analysis where the biomedical question and interpretation are central; it is not the general bioinformatics or computational-biology parent field.",
    },
    "D003:intelligent-agents-and-robotics": {
        "old_label": "Intelligent Agents and Robotics",
        "label": "Intelligent Agents, Planning and Robot Learning",
        "description": "Develop systems that sense, reason, plan, learn and act, including agent-based and robot-learning methods. Robot mechanisms, control hardware, full-system integration and deployment belong to the dedicated Robotics Engineering and Systems Design domain (D140).",
        "boundary": "AI methods for agents, planning, reasoning, perception and robot learning; it does not own complete robot mechanisms, control hardware, integration or deployment.",
    },
    "D031:retail-and-wholesale-sales": {
        "old_label": "Retail and Wholesale Sales",
        "label": "Wholesale, B2B and General Sales Practice",
        "description": "Sell and advise on goods or services through wholesale, business-to-business and general sales contexts, helping buyers evaluate and acquire suitable offerings. Frontline retail, merchandising, shop operations and omnichannel retail belong to Retail Sales and Shop Operations (D085).",
        "boundary": "Wholesale, business-to-business and general sales work; it excludes the dedicated retail-store, merchandising and omnichannel operations scope of D085.",
    },
    "D037:criminal-justice": {
        "old_label": "Criminal Justice",
        "label": "Criminal Law and Legal Advocacy",
        "description": "Apply legal knowledge to criminal offences, procedure, representation, prosecution, defence and rights-based legal advocacy. Criminology, policing systems, corrections, rehabilitation and re-entry belong to the dedicated Criminology, Criminal Justice and Corrections domain (D151).",
        "boundary": "Criminal-law and legal-advocacy practice; it does not represent the wider criminal-justice system, policing or corrections domain.",
    },
    "D037:intellectual-property-technology-and-data-law": {
        "old_label": "Intellectual Property, Technology and Data Law",
        "label": "Technology, Privacy and Data Law",
        "description": "Advise on technology, privacy, data governance, digital liability and related legal compliance. Dedicated intellectual-property rights, patent prosecution, licensing and IP portfolio practice belong to Intellectual Property Law and Patent Practice (D163).",
        "boundary": "Technology, privacy and data legal practice; it excludes the dedicated IP-rights and patent-practice route in D163.",
    },
    "D046:community-and-social-development": {
        "old_label": "Community and Social Development",
        "label": "Community and Social Development",
        "description": "Work with communities and organizations on participation, collective problem-solving, social inclusion, development and locally grounded change.",
        "boundary": "Community-development and social-work practice focused on collective participation and locally grounded change; welfare-service coordination belongs under the distinct D128 route.",
    },
    "D049:vehicle-testing-validation-and-driving-automation": {
        "old_label": "Vehicle Testing, Validation and Driving Automation",
        "label": "Vehicle Testing and Validation",
        "description": "Plan and conduct vehicle and system verification and validation, including conventional vehicle performance, safety, simulation and proving-ground testing. Automated-driving perception, localization, planning, control and autonomy-specific safety belong to Autonomous Vehicles and Self-Driving Systems (D166).",
        "boundary": "General vehicle testing and validation; it does not duplicate the autonomy-specific software, operational-design-domain and self-driving-systems route in D166.",
    },
    "D053:travel-tourism-and-visitor-services": {
        "old_label": "Travel, Tourism and Visitor Services",
        "label": "Hospitality Visitor and Guest Services",
        "description": "Deliver visitor-facing services through accommodation, food-service and hospitality operations, helping guests receive information, support and a coordinated experience. Travel planning, tour operations and destination management belong to Travel and Tourism (D083).",
        "boundary": "Hospitality-based visitor and guest services; it excludes the dedicated travel-planning, tour-operation and destination-management scope of D083.",
    },
    "D072:land-surveying-cadastre": {
        "old_label": "Land Surveying and Cadastre",
        "label": "Geospatial Land Information and GIS",
        "description": "Organize, analyze and communicate geospatial information for land administration, mapping and planning. Cadastral and boundary surveying, including legal parcel demarcation, belongs to Land Surveying and Cadastral Mapping (D156).",
        "boundary": "Geospatial land information, GIS and land-administration data; it does not imply authority to carry out professional cadastral or boundary surveys in the D156 route.",
    },
    "D068:biomedical-laboratory-diagnostics": {
        "old_label": "Biomedical Laboratory Diagnostics",
        "label": "Medical Laboratory Diagnostics (Dedicated D122 Route)",
        "description": "Compatibility redirect to the dedicated Medical Laboratory Technology domain (D122). Clinical specimen analysis, laboratory method validation, quality assurance and diagnostic interpretation belong to that dedicated route, not to the broader Allied Health and Rehabilitation Therapies domain.",
        "boundary": "Retired as an independent D068 specialization; use D122 for medical laboratory technology and diagnostic laboratory practice.",
    },
    "D068:medical-imaging-and-radiography": {
        "old_label": "Medical Imaging and Radiography",
        "label": "Radiography and Medical Imaging (Dedicated D123 Route)",
        "description": "Compatibility redirect to the dedicated Radiography and Medical Imaging domain (D123). Image acquisition, modality-specific radiography, imaging quality and radiation-safety practice belong to that dedicated route, not to the broader Allied Health and Rehabilitation Therapies domain.",
        "boundary": "Retired as an independent D068 specialization; use D123 for radiography and medical-imaging practice.",
    },
    "D128:community-and-social-development": {
        "old_label": "Community and Social Development",
        "label": "Community Welfare Outreach and Participation",
        "description": "Support welfare-service outreach, participation and community engagement around child, youth, family and adult support services. Broad community-development and social-work practice belongs to Social Work and Community Development (D046).",
        "boundary": "Welfare-service outreach and participation within social-welfare and youth services; it does not duplicate the broader community-development practice area in D046.",
    },
    "D165:clinical-exercise-physiology": {
        "old_label": "Clinical Exercise Physiology",
        "label": "Clinical Exercise Physiology (Dedicated D154 Route)",
        "description": "Compatibility redirect to the dedicated Exercise Science and Sports Therapy domain (D154). Clinical exercise assessment and prescription require the relevant education, supervised experience, credentials and jurisdictional scope; wellness coaching alone does not provide that authority.",
        "boundary": "Retired as an independent D165 specialization; use D154 for clinical exercise physiology and preserve the distinction from non-clinical wellness coaching.",
    },
}


def _newline(data: bytes) -> bytes:
    return b"\r\n" if b"\r\n" in data else b"\n"


def _replace_structure_header(data: bytes, area_id: str, repair: dict[str, str]) -> bytes:
    nl = _newline(data)
    old = nl.join(
        [
            f'        "area_id": "{area_id}",'.encode(),
            f'        "label": "{repair["old_label"]}",'.encode(),
            f'        "description": "{repair["description"] if False else "__OLD_DESCRIPTION__"}",'.encode(),
        ]
    )
    # Locate the area header by stable ID, then use the next four fields so
    # descriptions containing punctuation do not require a global replacement.
    marker = f'        "area_id": "{area_id}",'.encode() + nl
    start = data.find(marker)
    if start < 0:
        raise RuntimeError(f"Missing area {area_id}")
    label_start = start + len(marker)
    description_marker = b'        "description": "'
    boundary_marker = b'        "boundary": "'
    label_end = data.find(nl, label_start)
    current_label = data[label_start:label_end].decode("utf-8")
    if f'"label": "{repair["label"]}"' in current_label:
        return data
    if f'"label": "{repair["old_label"]}"' not in current_label:
        raise RuntimeError(f"Unexpected current label for {area_id}: {current_label}")
    desc_start = data.find(description_marker, label_end + len(nl))
    desc_end = data.find(b'",' + nl, desc_start)
    boundary_start = data.find(boundary_marker, desc_end + len(b'",' + nl))
    boundary_end = data.find(b'",' + nl, boundary_start)
    if min(label_end, desc_start, desc_end, boundary_start, boundary_end) < 0:
        raise RuntimeError(f"Malformed header for {area_id}")
    label_line = f'        "label": "{repair["label"]}",'.encode()
    desc_line = f'        "description": "{repair["description"]}",'.encode()
    boundary_line = f'        "boundary": "{repair["boundary"]}",'.encode()
    replacement = label_line + nl + desc_line + nl + boundary_line
    old_span_end = boundary_end + len(b'",')
    return data[:label_start] + replacement + data[old_span_end:]


def _replace_structure_boundary(data: bytes, area_id: str, new_boundary: str) -> bytes:
    nl = _newline(data)
    marker = f'        "area_id": "{area_id}",'.encode() + nl
    start = data.find(marker)
    if start < 0:
        raise RuntimeError(f"Missing area {area_id}")
    boundary_marker = b'        "boundary": "'
    boundary_start = data.find(boundary_marker, start + len(marker))
    boundary_end = data.find(b'",' + nl, boundary_start)
    if boundary_start < 0 or boundary_end < 0:
        raise RuntimeError(f"Malformed boundary for {area_id}")
    current = data[boundary_start + len(boundary_marker):boundary_end].decode("utf-8")
    if current == new_boundary:
        return data
    line_start = data.rfind(nl, start, boundary_start) + len(nl)
    replacement = f'        "boundary": "{new_boundary}",' .encode()
    return data[:line_start] + replacement + data[boundary_end + len(b'",'):]


def _replace_catalogue_area(data: bytes, area_id: str, repair: dict[str, str]) -> bytes:
    text = data.decode("utf-8")
    marker = f'"area_key": "{area_id}"'
    start = text.find(marker)
    if start < 0:
        raise RuntimeError(f"Missing catalogue area {area_id}")
    end = text.find("\n        },\n        {", start)
    if end < 0:
        end = text.find("\n      ],", start)
    if end < 0:
        raise RuntimeError(f"Malformed catalogue area block {area_id}")
    block = text[start:end]
    label_marker = '"label": "'
    label_start = block.find(label_marker)
    label_end = block.find('"', label_start + len(label_marker))
    if label_start < 0 or label_end < 0:
        raise RuntimeError(f"Missing catalogue label {area_id}")
    block = block[:label_start] + label_marker + repair["label"] + block[label_end:]
    boundary_marker = '"boundary": "'
    boundary_start = block.find(boundary_marker)
    boundary_end = block.find('"', boundary_start + len(boundary_marker))
    if boundary_start < 0 or boundary_end < 0:
        raise RuntimeError(f"Missing catalogue boundary {area_id}")
    block = block[:boundary_start] + boundary_marker + repair["boundary"] + block[boundary_end:]
    return (text[:start] + block + text[end:]).encode("utf-8")


def _replace_catalogue_boundary(data: bytes, area_id: str, new_boundary: str) -> bytes:
    text = data.decode("utf-8")
    marker = f'"area_key": "{area_id}"'
    start = text.find(marker)
    if start < 0:
        raise RuntimeError(f"Missing catalogue area {area_id}")
    end = text.find("\n        },\n        {", start)
    if end < 0:
        end = text.find("\n      ],", start)
    if end < 0:
        raise RuntimeError(f"Malformed catalogue area block {area_id}")
    block = text[start:end]
    boundary_marker = '"boundary": "'
    boundary_start = block.find(boundary_marker)
    boundary_end = block.find('"', boundary_start + len(boundary_marker))
    if boundary_start < 0 or boundary_end < 0:
        raise RuntimeError(f"Missing catalogue boundary {area_id}")
    block = block[:boundary_start] + boundary_marker + new_boundary + block[boundary_end:]
    return (text[:start] + block + text[end:]).encode("utf-8")


def main() -> None:
    structure = DOMAIN_STRUCTURE.read_bytes()
    for area_id, repair in REPAIRS.items():
        structure = _replace_structure_header(structure, area_id, repair)
    structure = _replace_structure_boundary(
        structure,
        "D046:community-and-social-development",
        REPAIRS["D046:community-and-social-development"]["boundary"],
    )
    DOMAIN_STRUCTURE.write_bytes(structure)

    catalog = SPECIALIZATION_CATALOG.read_bytes()
    for area_id, repair in REPAIRS.items():
        catalog = _replace_catalogue_area(catalog, area_id, repair)
    catalog = _replace_catalogue_boundary(
        catalog,
        "D046:community-and-social-development",
        REPAIRS["D046:community-and-social-development"]["boundary"],
    )
    # The canonical D078 fix was already applied; update its recommendation
    # text in the evidence catalogue so the supporting report is not stale.
    catalog = catalog.replace(
        b"Psychology and Social Behaviour; Human Geography",
        b"Social Behaviour and Interaction; Human Geography",
        1,
    )
    catalog = catalog.replace(
        b"Land Surveying and Cadastre; Hydrography",
        b"Geospatial Land Information and GIS; Hydrography",
        1,
    )
    SPECIALIZATION_CATALOG.write_bytes(catalog)
    print(f"Applied {len(REPAIRS)} overlap repairs; D078 was already applied before this pass.")


if __name__ == "__main__":
    main()
