import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D139_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D139_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D139 keys and task descriptions for all mappings.", "supports": "The actual recorded tasks assessed for fit with game design and animated-world production.", "limit": "The queue is the audited record, not independent proof of the occupation's full scope."},
    "ONET_VIDEO_GAME_DESIGNER": {"publisher": "U.S. Department of Labor, O*NET OnLine", "url": "https://www.onetonline.org/link/summary/15-1255.01", "locator": "Video Game Designers (15-1255.01): define core features, mechanics, storylines and biographies; maintain design documentation and collaborate with production staff.", "supports": "Game-specific design and level-design task boundaries.", "limit": "U.S. occupational taxonomy is corroboration, not a global taxonomy or automatic mapping rule."},
    "BLS_ANIMATION_AND_GAMES": {"publisher": "U.S. Bureau of Labor Statistics", "url": "https://www.bls.gov/ooh/arts-and-design/multimedia-artists-and-animators.htm", "locator": "Special effects artists and animators: create 2D/3D models, animation and visual effects for games and other media; may focus on game characters or level scenery.", "supports": "Animation, modeling and visual-effects work that may serve game production, while noting the wider non-game media scope.", "limit": "The source explicitly covers multiple media; a generic animation title alone does not prove game specialization."},
    "BLS_WEB_AND_DIGITAL_DESIGN": {"publisher": "U.S. Bureau of Labor Statistics", "url": "https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm", "locator": "Web developers create and maintain websites; digital designers design/test website and interface layout, functions and navigation for usability.", "supports": "Distinguishing general web/interface work from game-specific UI/UX tasks.", "limit": "General web duties are not assumed to be game production."},
    "IGDA_INDUSTRY_CONTEXT": {"publisher": "International Game Developers Association (IGDA)", "url": "https://igda.org/resourcelibrary/game-industry-standards/", "locator": "IGDA describes the global game-development industry as multidisciplinary interactive-media production.", "supports": "Context that game production combines creative and technical disciplines.", "limit": "The cited page is broad industry context, not a definitive job-title list or fit test."},
}

G = "supported"
C = "conditional"
U = "unsupported_for_domain"

DECISIONS = {
    "3D animator": (C, "Creates 3D animation, but the task description does not specify games; the same work also serves film, television and other media.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "3D modeller": (C, "Creates 3D models, but no game asset or animated-world use is stated; this task also occurs across design, visualization and other media.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "ICT test analyst": (C, "Plans software/product tests generically. This could support a game team, but the record does not identify game software, gameplay or interactive-media testing.", ["QUEUE_TASK_PROFILE", "IGDA_INDUSTRY_CONTEXT"]),
    "animation director": (C, "Leads animation teams and quality/delivery, but the task profile is medium-general rather than tied to game or animated-world production.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "animation layout artist": (C, "Plans 3D animation shots, camera angles, framing and lighting. The record does not say the animation is for games rather than film/television.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "animator": (C, "Creates sequenced moving images, which can be used in games, but the task description does not establish a game/interactive-media context.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "art director": (C, "Directs visual concepts and artistic projects across theatre, marketing, advertising, video, film, fashion and online work. Game production is possible but not established by this broad task profile.", ["QUEUE_TASK_PROFILE", "IGDA_INDUSTRY_CONTEXT"]),
    "digital artist": (C, "Creates digitally produced art across media; the profile does not specify game assets or animated worlds.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "digital games designer": (G, "Defines digital-game layout, logic, concept and gameplay; this is directly within game design.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER"]),
    "digital games developer": (G, "Programs and implements digital games, including gameplay, graphics, sound and function; direct game-production work.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER", "IGDA_INDUSTRY_CONTEXT"]),
    "digital games tester": (G, "Tests digital games for defects, functionality, graphics and playability; direct game QA.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER"]),
    "digital media designer": (C, "Creates integrated multimedia and may work with AR/VR/web/social media, but the task is broader than games and does not establish game production.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "gambling games designer": (U, "Designs betting, gambling and lottery games. That is not the video-game/animated-world scope of D139; the role belongs to gambling-game operations/design rather than this domain as described.", ["QUEUE_TASK_PROFILE"]),
    "game QA tester": (G, "Tests game builds/features, reproduces defects and reports evidence to improve quality and player experience; exact game-production QA.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER"]),
    "game UI/UX designer": (G, "Designs game interfaces, information flow and player interactions for the game experience; explicit player-facing game design.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER"]),
    "game animator": (G, "Creates and integrates animation for characters, cameras and gameplay feedback; explicitly game-specific animation.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "game character artist": (G, "Creates game-ready characters, creatures and related visual assets within a game's art direction; direct animated/game asset work.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "game concept artist": (G, "Develops visual concepts for game characters, environments and props before production; direct game art pipeline.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "game designer": (G, "Defines game rules, mechanics, player experience and design specifications and iterates through prototypes/playtests; core game-design work.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER"]),
    "game environment artist": (G, "Creates game-ready environments, props and world assets; direct animated-world/game production.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "game narrative designer": (G, "Designs story, dialogue, world-building and narrative systems for interactive game structures; direct game-design scope.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER"]),
    "game producer": (G, "Coordinates game-production people, schedule, budget and release delivery; explicitly leads game production.", ["QUEUE_TASK_PROFILE", "IGDA_INDUSTRY_CONTEXT"]),
    "game sound designer": (G, "Creates and integrates sound effects and audio direction for the player experience and game production; explicit game-audio work.", ["QUEUE_TASK_PROFILE", "IGDA_INDUSTRY_CONTEXT"]),
    "gameplay programmer": (G, "Implements gameplay interactions, systems and features; the recorded programming is explicitly for games.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER"]),
    "graphic designer": (C, "Creates visual communication for print/online media generally. Game interface or asset work is possible, but is not established by this task profile.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "illustrator": (C, "Creates illustrations for texts and publications broadly; game concept/asset illustration is possible but not specified.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "level designer": (G, "Builds game levels, missions and spaces and creates player challenges; directly matches video-game design.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER"]),
    "performance video designer": (U, "Designs projected visuals for live performance. That is stage/performance media, not video-game design or animated-world production as scoped here.", ["QUEUE_TASK_PROFILE"]),
    "production designer": (U, "Creates the visual concept, sets, lighting and locations for television, film and commercials; the recorded production medium is not games.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "software analyst": (C, "Elicits and documents software requirements and tests applications generally. A game team could use this work, but the role record does not identify games or interactive entertainment.", ["QUEUE_TASK_PROFILE", "IGDA_INDUSTRY_CONTEXT"]),
    "software developer": (C, "Develops software systems generally. Game development is one possible application, but the task record does not specify games.", ["QUEUE_TASK_PROFILE", "IGDA_INDUSTRY_CONTEXT"]),
    "software tester": (C, "Tests software generally. Game QA is a possible application, but this record does not establish game software or player-facing features.", ["QUEUE_TASK_PROFILE", "IGDA_INDUSTRY_CONTEXT"]),
    "special effects artist": (C, "Creates visual illusions for movies, videos and computer games. Games are an explicit possible medium, but the record spans non-game media, so fit is conditional on game-production assignment.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "stop-motion animator": (C, "Animates puppets or clay models. The task may produce game-related animated content, but the record does not establish interactive/game production.", ["QUEUE_TASK_PROFILE", "BLS_ANIMATION_AND_GAMES"]),
    "technical artist": (G, "Builds game-content pipelines, shaders, tools and technical standards and bridges art with engineering; direct game-production responsibility.", ["QUEUE_TASK_PROFILE", "IGDA_INDUSTRY_CONTEXT"]),
    "technical director": (C, "Coordinates technical realization of creative productions across units and media. The record does not establish a game studio or game-production remit.", ["QUEUE_TASK_PROFILE", "IGDA_INDUSTRY_CONTEXT"]),
    "technical game designer": (G, "Translates game-design intent into implementable gameplay systems, scripts and tools; explicitly game-specific technical design.", ["QUEUE_TASK_PROFILE", "ONET_VIDEO_GAME_DESIGNER"]),
    "user interface designer": (C, "Designs interfaces for applications and systems generally. A game UI is possible, but the role description does not identify games or player interaction.", ["QUEUE_TASK_PROFILE", "BLS_WEB_AND_DIGITAL_DESIGN"]),
    "web content manager": (U, "Manages organizational web content, compliance and search optimization. This is not game design or animated-world production as described.", ["QUEUE_TASK_PROFILE", "BLS_WEB_AND_DIGITAL_DESIGN"]),
    "web designer": (C, "Designs website visuals, layout and usability generally. A game portal may need this work, but game/animated-world production is not stated.", ["QUEUE_TASK_PROFILE", "BLS_WEB_AND_DIGITAL_DESIGN"]),
    "web developer": (C, "Builds web-accessible software and aligns websites to client strategy. Game services may use such work, but the recorded task is not game-specific.", ["QUEUE_TASK_PROFILE", "BLS_WEB_AND_DIGITAL_DESIGN"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D139"]
    names = [row["role_name"] for row in rows]
    if len(rows) != 41 or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D139 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D139", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare each role's recorded duties with game design and animated-world creation. Mark supported only where the task explicitly concerns game design, game assets, gameplay, game QA or game production. Mark broad multi-medium creative/software work conditional when game application is plausible but unstated. Exclude clearly different domains such as gambling-game design and live-performance projection. Neither title similarity nor subgroup placement establishes fit.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[G], "conditional": tally[C], "unsupported_for_domain": tally[U], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 41 exact D139 queue mappings were reviewed against their task descriptions; no mapping is inferred from subgroup membership.", "O*NET and BLS provide occupational task context; IGDA is broad industry context. None is treated as a universal job-title taxonomy or licensing authority.", "No role-to-specialization assignment, student-path recommendation or canonical mapping/taxonomy change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D139 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[G]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally[U]}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
