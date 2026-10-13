"""Materialize the final source-grounded D167-D168 specialization reviews."""
from __future__ import annotations
import argparse, json
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROWS=[
{
"domain_id":"D167","domain_name":"Extended Reality (XR) and Immersive Technology","current_subgroup_count":7,
"current_subgroups":["Extended Reality Designers & Hardware Engineers (5)","Extended Reality Innovation & Solution Architecture (1)","Augmented and Virtual Reality Software Developers (3)","Legal, social and cultural professionals (1)","Science and engineering associate professionals (1)","Extended Reality Technical Support Specialists (1)","Food/craft trades workers (1)"],
"current_state":"Seven records combine three potentially XR-relevant custom groupings, three broad ISCO classes and one unrelated trade group. The custom labels mix user experience/content, hardware, software and architecture; IEEE's standards portfolio reflects multiple technology and human-factors concerns but does not prescribe occupational or learner taxonomies.",
"parent_scope_disposition":"Retain XR as an umbrella for systems combining digital and physical/immersive environments, including VR, AR and MR. Distinguish building XR experiences from device/platform engineering and application integration. Do not equate every 3D, game, visualization or digital-twin role with XR without immersive-system tasks.",
"candidate_areas":[
{"label":"XR Experience, Interaction and Content Design","scope":"Design immersive interaction, spatial user experience, content and scenarios for a defined XR application.","route_boundary":"Design/content practice may share interaction design with game/media fields; include only if XR-specific spatial interaction and testing are core."},
{"label":"XR Software and Real-Time Application Development","scope":"Build XR applications, interaction logic, rendering/runtime integration and application-specific services.","route_boundary":"Separate application engineering from generic software development and from the platform/hardware layer."},
{"label":"XR Devices, Tracking and Platform Engineering","scope":"Develop or integrate head-mounted displays, sensors, tracking, input, graphics and system-level hardware/software components.","route_boundary":"IEEE device taxonomies and engineering standards support technical distinctions but do not establish this exact subgroup name."},
{"label":"Human Factors, Accessibility, Safety and Evaluation","scope":"Assess comfort, usability, accessibility, motion-related risks, privacy and ethical effects of immersive products and systems.","route_boundary":"Human-factors work cuts across product design and engineering; treat as a specialization only where learning sequence is substantial, otherwise cross-cutting competencies."}],
"decision":"IEEE's Digital Reality standards portfolio includes AR/VR device taxonomy, immersive interfaces, content/stream formats, environment safety and XR ethical assessment. This is authoritative evidence that XR work spans device, content/interface, system and human/social concerns, but standards workstreams are not a universal career taxonomy. The three existing custom labels are relevant starting signals but need sharper separation; generic ISCO groups and the unrelated trade group should not define student specializations. Four candidate routes remain provisional pending domain-role task review.",
"omissions_and_over_splitting":"Do not create subgroups for every headset, engine, application sector, rendering technique or XR modality. Keep game development, 3D art, simulation, digital twins, industrial design and general IT support linked only where role tasks specifically involve immersive systems.",
"computational_signal":"Real-time 3D programming, spatial computing, computer vision/tracking, graphics, simulation and interaction analytics are core to some routes. Design, research, production and evaluation paths may use different or less code-intensive toolsets; none is a universal foundation for all XR work.",
"jurisdiction_note":"Accessibility, health/safety, biometric/privacy, consumer-protection and data rules differ by jurisdiction and application. IEEE standards and projects are technical/professional evidence, not personal certifications or legal approvals.",
"no_specialization_disposition":None,
"sources":[
{"publisher":"IEEE Standards Association (IEEE-SA)","title":"IEEE Digital Reality Standards","url":"https://digitalreality.ieee.org/standards/","locator":"Lists active and developing standards/projects for VR/AR device taxonomies, immersive interfaces, video/content, safety and related systems; notes participation spans device makers, content/service providers and technology developers.","supports":"Evidence for the range of technical and content-system practices within digital reality/XR.","limitation":"Standards project subjects are not occupations, curricula or a settled global subgroup count."},
{"publisher":"IEEE Standards Association","title":"P7030 Recommended Practice for Ethical Assessment of XR Technologies","url":"https://standards.ieee.org/ieee/7030/10799/","locator":"Project scope covers definitions/classifications for XR (AR, VR, immersive web and spatial web) and socio-technical/ethical assessment of XR products, services and systems.","supports":"XR scope extends beyond software and devices to applications and human/social assessment.","limitation":"A recommended-practice project does not define occupational certification or require a standalone specialization."},
{"publisher":"IEEE Standards Association","title":"IEEE 3079-2020: HMD-Based VR Sickness Reduction Technology","url":"https://standards.ieee.org/ieee/3079/7283/","locator":"Standard record describes VR sickness reduction; related work includes motion-to-photon latency and mixed-reality motion-training system frameworks.","supports":"Human factors, comfort, evaluation and interaction are technically significant XR work concerns.","limitation":"Narrow standards example, not a full XR profession taxonomy."}],
"review_status":"source_reviewed_candidate_xr_functions_supported_but_not_universal_taxonomy"},
{
"domain_id":"D168","domain_name":"Esports and Creator Economy","current_subgroup_count":6,
"current_subgroups":["Esports Operations & Management (1)","Esports Community & Partnerships (2)","Esports Broadcast & Content Production (4)","Esports Team & Player Management (2)","Competitive Performance & Analysis (3)","Information and communications technicians (1)"],
"current_state":"The six groups are mostly esports-oriented and include one generic broadcast technician class. They do not capture creator-economy work as an equivalent specialization system. The parent joins organized competitive gaming (leagues, teams, events, broadcast) with cross-platform individual/collective digital-content businesses; these have overlapping media skills but distinct markets and operating models.",
"parent_scope_disposition":"Treat the combined root as structurally suspect. Prefer distinct Esports and Digital Creator/Platform Work domains or clearly separated parent branches before accepting subgroup counts. Esports has organized competition and governing/event structures; creator work spans platforms and forms including video, streaming, music, writing and digital services. Creator economy is an emerging umbrella, not a globally standardized profession taxonomy.",
"candidate_areas":[
{"label":"Esports Competition and Event Operations","scope":"Organize tournaments, competition calendars, rules, venues/platforms, production logistics and event delivery.","route_boundary":"IESF/competition institutions support organized competitive activity; publisher/league rules can differ by game and event."},
{"label":"Esports Teams, Players and Performance","scope":"Support competitive teams and players through coaching, training, performance analysis, team operations and player welfare.","route_boundary":"Do not infer licensed sports-science, clinical or counseling competence from an esports team role."},
{"label":"Esports Broadcast, Content and Audience Partnerships","scope":"Produce and distribute competition coverage, commentary/editorial content, audience engagement and commercial partnerships.","route_boundary":"Shares media work with creator practice but remains anchored in organized esports properties/events."},
{"label":"Digital Creator and Platform-Based Content Work (provisional; separate-parent review)","scope":"Create, distribute and sustain audience-facing digital content or services through one or more online platforms and related monetization/partnerships.","route_boundary":"OECD/ILO/EU measurement guidance defines platform work broadly, not a creator occupation family. Platform monetization, analytics and eligibility are platform-specific; do not imply guaranteed income or universal career ladders."}],
"decision":"IESF describes itself as an international esports federation with member nations and organized championships; Olympic Movement materials recognize organized esports events. These support competition/event structures, not a universal job taxonomy. OECD/ILO/EU guidance provides a conceptual framework for digital-platform work but does not establish a creator-economy profession family. The current six labels are largely esports-specific and omit creator work; therefore the combined parent should be split or clearly partitioned before deciding a count. Four candidate practice areas are provisional; the creator branch has weaker taxonomy evidence and is explicitly not an accepted global subgroup.",
"omissions_and_over_splitting":"Do not treat game titles, platforms, creator niches, monetization features or content formats as separate specializations. Do not merge esports player, broadcast, community, event and creator roles merely because each can publish online. Do not invent a universal creator role or credential; evidence for creator work is platform- and market-dependent.",
"computational_signal":"Broadcast pipelines, audience analytics, platform dashboards, moderation systems, competitive game telemetry and creator analytics support selected work. These are use-case-specific and platform-dependent, not common requirements or proof of a formal computational specialization.",
"jurisdiction_note":"Esports governance, labor status, safeguarding, gambling/anti-doping rules, IP rights, sponsorship disclosure, tax and platform monetization vary by game, country and platform. IESF and Olympic materials have institutional scope; OECD platform-work definitions are statistical, not legal employment determinations. No Nigeria-only evidence is generalized globally.",
"no_specialization_disposition":None,
"sources":[
{"publisher":"International Esports Federation (IESF)","title":"International Esports Federation","url":"https://www.iesf.org/","locator":"Identifies IESF as a global esports federation, describes member nations and world championships, and lists official game titles.","supports":"Organized competitive esports, federation and event context.","limitation":"Federation remit does not define a complete global occupation or subgroup taxonomy; game titles and rules evolve."},
{"publisher":"International Olympic Committee (IOC)","title":"The Olympic Esports Games","url":"https://img.olympics.com/images/image/private/fl_attachment/primary/ta3mdy5mqdmxakymp98i.pdf","locator":"IOC document describes esports' participation in organized Olympic Movement events and the development of the Olympic Esports Games concept.","supports":"Institutional evidence that esports includes organized competitive events and governance beyond individual content creation.","limitation":"IOC initiatives do not define all esports careers or validate a universal specialization structure."},
{"publisher":"OECD, International Labour Organization and European Commission","title":"Handbook on Measuring Digital Platform Employment and Work","url":"https://www.oecd.org/en/publications/handbook-on-measuring-digital-platform-employment-and-work_0ddcac3b-en.html","locator":"Provides a conceptual framework and definition for productive work organized through digital platforms; notes the variety of platform work and statistical measurement limits.","supports":"Cross-platform employment/work is a broad and varied category, supporting caution about treating Creator Economy as one settled occupation taxonomy.","limitation":"Statistical measurement framework does not establish job titles, skill requirements or creator-specific career pathways."},
{"publisher":"YouTube Help","title":"Get started with YouTube Analytics","url":"https://support.google.com/youtube/answer/9002587?hl=en-GB","locator":"Explains platform-specific channel/video analytics and revenue reporting, including eligibility and programme-dependent features.","supports":"Concrete example that creator tools and monetization are specific to platform features and participation rules.","limitation":"Single-platform documentation; not generalizable as a universal creator skill or income pathway."}],
"review_status":"source_reviewed_parent_conflates_esports_and_emerging_creator_work_split_recommended"}
]

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--refresh',action='store_true'); args=parser.parse_args()
    batch={"schema_version":"2026-10-05.specialization-domain-review-batch.v1","range":{"first_domain_id":"D167","last_domain_id":"D168","count":2},"review_method":"International primary-source audit of parent scope, subgroup labels/count, candidate practice areas, boundaries, computational signals and jurisdiction. Two-ID final residual batch; candidates are not accepted canonical taxonomy.","canonical_changes":0,"role_specialization_assignments":0,"domains":ROWS}
    (HERE/'D167_D168_reviews_checkpoint_010.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    for r in ROWS:
        jp=HERE/f"{r['domain_id']}_specialization_candidate_review_2026_10_05.json"; mp=HERE/f"{r['domain_id']}_specialization_candidate_review_2026_10_05.md"
        if (jp.exists() or mp.exists()) and not args.refresh: raise FileExistsError(r['domain_id'])
        jp.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        areas='\n'.join(f"- **{a['label']}** — {a['scope']} Boundary: {a['route_boundary']}" for a in r['candidate_areas'])
        sources='\n'.join(f"- [{s['publisher']}: {s['title']}]({s['url']}) — {s['locator']} Supports: {s['supports']} Limitation: {s['limitation']}" for s in r['sources'])
        md=f"""# {r['domain_id']}: {r['domain_name']} — specialization audit

Status: `{r['review_status']}`. Evidence review only; not canonical taxonomy approval or academic-body sign-off.

## Existing structure

Current subgroup-record count: **{r['current_subgroup_count']}**. Current records: {'; '.join(r['current_subgroups'])}

{r['current_state']}

## Parent scope and disposition

{r['parent_scope_disposition']}

{r['decision']}

## Candidate areas of specialization

{areas}

## Boundaries and cross-cutting considerations

- Omissions / over-splitting: {r['omissions_and_over_splitting']}
- Computational signal: {r['computational_signal']}
- Jurisdiction note: {r['jurisdiction_note']}

## Sources and limits

{sources}

Evidence supports candidate distinctions, not a universal subgroup count. Existing role membership is not treated as proof of fit. No role-to-specialization mapping is made.
"""
        mp.write_text(md,encoding='utf-8')
    print('Wrote final D167-D168 review batch and individual pairs.')

if __name__=='__main__': main()
