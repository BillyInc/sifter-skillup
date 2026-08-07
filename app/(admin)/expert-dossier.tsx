import { ExpertDossierScreen } from "../../src/screens/admin/ExpertDossierScreen";

// Expert Dossier (§6A.2) — the mapping-flag SUBMIT form. Admins/educators flag
// a programme→domain, domain→role or role→skill edge as wrong; reviewing those
// flags is internal Sifter-team tooling, not part of admin mode.
export default function ExpertDossierRoute() {
  return <ExpertDossierScreen />;
}
