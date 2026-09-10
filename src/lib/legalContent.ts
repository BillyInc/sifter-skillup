/**
 * User-facing legal copy shared by the Expo and Vite auth flows.
 *
 * Keep this in one place so the document a user reads is the same document
 * whose version is recorded by the API. Operator identity/address remain
 * runtime configuration and are injected into the privacy sections.
 */
export const TERMS_SECTIONS: ReadonlyArray<readonly [string, string]> = [
  ['Who we are', 'Sifter LevelUp is a career-intelligence and education platform operated for students, educators, schools, tutorial centres and institutions.'],
  ['What the platform does', 'We help users explore starting points, subjects, programmes, schools, domains, subgroups, roles, skills, tools, certifications and market-intelligence signals.'],
  ['Guidance, not a guarantee', 'Programme mappings, role readiness, demand, salary and remote-work signals are guidance. They are not admission, employment, salary, migration, legal, financial or professional advice.'],
  ['Admissions and school data', 'School requirements and programme information can change and should be checked with the relevant institution. We do not guarantee admission, eligibility, scholarship access or school placement.'],
  ['Opportunities and market intelligence', 'Opportunity postings, salary ranges, employer lists and trend labels are estimates from available sources. Low-volume/high-value roles may be selective; high-volume roles may still have lower pay or progression limits.'],
  ['Students and minors', 'Senior-secondary students and other minors should use LevelUp with guidance from a parent, guardian, school or counsellor. Individual student visibility for institutions requires consent where applicable.'],
  ['Educators and institutions', 'Institution dashboards use aggregate intelligence. Verification does not by itself unlock individual student details. Student records, rosters and provisioning remain consent-gated.'],
  ['Guest use', 'Guests may browse limited Explore surfaces. Saving, notes, alerts, student management and institution-specific features require an account and, where relevant, acceptance of these terms.'],
  ['Acceptable use', 'Do not abuse the service, attack the platform, scrape restricted data, impersonate a school or educator, upload unlawful content, or use the platform to mislead students.'],
  ['Your content', 'You keep ownership of notes, saved paths, feedback and any learning artifacts you create. You give us permission to store, process and display them only to operate the service.'],
  ['Privacy, consent and Nigerian safeguards', 'We apply the Nigeria Data Protection Act 2023 and applicable NDPC guidance to personal-data handling. Consent must be a clear affirmative choice; silence is not consent, and you can withdraw consent where processing is based on consent. Optional analytics is off unless you opt in. We do not sell personal data.'],
  ['Children, students and school roles', 'Under-18 users should use the service with a parent, guardian, school or counsellor where appropriate. Student records, grades, guardian information and school rosters are role-limited and consent-gated where required. School owners and staff must only upload or view information they are authorised to handle under applicable Nigerian and state child-protection rules.'],
  ['Consumer fairness and complaints', 'Nothing here removes a non-waivable right under applicable consumer-protection law. We will not intentionally present guidance as a guarantee or hide material limitations. Report a concern to legal@sifter.app; privacy complaints may also be directed to the Nigeria Data Protection Commission and consumer complaints to the Federal Competition and Consumer Protection Commission where applicable.'],
  ['Automated guidance and challenge', 'Search ranking, programme matching and career guidance are decision-support features, not admission or employment decisions. They may be incomplete or wrong. You can ask us to explain, correct or review material personal-data issues through privacy@sifter.app.'],
  ['Third-party services', 'Some sources, schools, job boards, professional bodies, APIs and linked services have their own terms. Their data, availability and rules may change without notice.'],
  ['Changes and suspension', 'We may change features, correct data, remove misleading content, suspend abusive accounts or restrict access where needed for security, compliance or platform integrity.'],
  ['Governing law', 'These terms are governed by the laws of the Federal Republic of Nigeria, except where mandatory consumer protections in another jurisdiction apply.'],
];

export function privacySections(operatorName: string, operatorAddress: string): ReadonlyArray<readonly [string, string]> {
  const operator = operatorName || 'Sifter LevelUp';
  const address = operatorAddress
    ? `Service address: ${operatorAddress}. `
    : 'The registered operating entity and Nigerian service address must be supplied in the production environment before launch. ';
  return [
    ['Who controls the data', `${operator} is the service operator. ${address}For privacy questions, access, correction, deletion, portability or complaints, contact privacy@sifter.app. Do not send identity documents by ordinary email unless requested through a verified support process.`],
    ['What data we collect', 'Account details, user type, starting point, subjects you choose to enter, saved programmes, schools, domains, subgroups, roles, notes, preferences, device/session data and security logs.'],
    ['Sensitive student data', 'We do not need grades, transcripts, exam documents or guardian documents for the core exploration flow. Institution roster visibility is consent-gated and should be limited to what is necessary.'],
    ['Why we process it', 'We process account and service data to provide the features you request, use consent for optional analytics and consent-gated student sharing, comply with legal or security duties where applicable, and use limited service-improvement interests where permitted. These purposes are separate: optional analytics is not required to create an account.'],
    ['Who receives it and where', 'Data may be handled by hosting, authentication, email, storage, support and optional analytics providers acting for the service. Schools receive only the roster or guidance information their role and the applicable consent state allow. Some providers may process data outside Nigeria; we use applicable contractual, security and transfer safeguards and will provide further information on request.'],
    ['How we use data', 'We use data to run the platform, restore sessions, personalize guidance, improve search, prevent abuse, support institution verification, generate aggregate intelligence and honour user requests.'],
    ['Analytics and product improvement', 'We may use consented or legally-permitted analytics to understand searches, drop-offs, saved paths and confusing screens. Analytics should be aggregated where possible and should not expose individual student records to institutions.'],
    ['Nigeria-first privacy basis', 'We design around the Nigeria Data Protection Act 2023 and applicable NDPC guidance: fair and transparent processing, purpose limitation, minimisation, accuracy, security, retention limits, affirmative consent and data-subject rights. Where Nigerian requirements differ by role, age, state or processing context, the applicable safeguard controls the feature.'],
    ['Minors and guardians', 'Senior-secondary users may be minors. We minimise grades and identity data, explain roster visibility, and require the appropriate guardian, student or school consent before consent-gated sharing. Child-rights protections can vary by Nigerian state, so schools must follow the law and safeguarding rules applicable to their students and location.'],
    ['International users', 'Users outside Nigeria may have additional local rights, including GDPR-style access, correction, portability, objection and erasure rights where applicable.'],
    ['Retention', 'We keep account and guidance data only as long as needed for the service, safety, legal compliance and auditability. Users may request deletion, subject to lawful retention requirements.'],
    ['Security', 'We use access controls, authentication, role boundaries and server-side checks to reduce unauthorised access. No web service can guarantee perfect security, so sensitive details should be collected sparingly.'],
    ['Automated matching and your challenge rights', 'Programme, subject and career matching is guidance and is not used as the sole basis for an admission, employment or other high-impact decision. You may ask for access, correction, human review or an explanation of a material personal-data issue through privacy@sifter.app.'],
    ['Your rights and choices', 'You can request access, correction, deletion, export, restriction or opt-out of non-essential communications and analytics by contacting privacy@sifter.app.'],
  ];
}
