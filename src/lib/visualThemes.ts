import { ISLANDS, type Island } from '../data/islands';

export type FieldVisualTheme = {
  id: string;
  label: string;
  icon: string;
  imageKey: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    gradient: [string, string, string];
  };
  simulator: {
    label: string;
    accent: string;
    soft: string;
    border: string;
  };
};

export type TrackVisualTheme = {
  id: string;
  fieldId: string;
  label: string;
  icon: string;
  imageKey: string;
  palette: FieldVisualTheme['palette'];
  simulator: FieldVisualTheme['simulator'];
};

export type IslandVisualTheme = {
  id: number;
  label: string;
  icon: string;
  imageKey: string;
  tier: Island['tier'];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    gradient: [string, string, string];
  };
  simulator: {
    label: string;
    accent: string;
    soft: string;
    border: string;
  };
};

export type SimulatorVisualTheme = {
  label: string;
  accent: string;
  soft: string;
  border: string;
};

const FIELD_VISUALS: Record<string, FieldVisualTheme> = {
  crypto: { id: 'crypto', label: 'Crypto', icon: '₿', imageKey: 'field-crypto', palette: { primary: '#F97316', secondary: '#FDBA74', accent: '#F97316', surface: '#FFF7ED', gradient: ['#1A0800', '#2D1200', '#3D1A00'] }, simulator: { label: 'CRYPTO SIM', accent: '#F97316', soft: '#FFF7ED', border: '#FED7AA' } },
  quant: { id: 'quant', label: 'Quant', icon: '📊', imageKey: 'field-quant', palette: { primary: '#5B5FCF', secondary: '#A5B4FC', accent: '#5B5FCF', surface: '#EEF2FF', gradient: ['#05030F', '#0D0A25', '#161240'] }, simulator: { label: 'QUANT SIM', accent: '#5B5FCF', soft: '#EEF2FF', border: '#C7D2FE' } },
  'ai-ml': { id: 'ai-ml', label: 'AI / ML', icon: '🧠', imageKey: 'field-ai-ml', palette: { primary: '#3B82F6', secondary: '#93C5FD', accent: '#3B82F6', surface: '#EFF6FF', gradient: ['#020B18', '#051830', '#091E3C'] }, simulator: { label: 'AI SIM', accent: '#3B82F6', soft: '#EFF6FF', border: '#BFDBFE' } },
  'software-engineering': { id: 'software-engineering', label: 'Software Engineering', icon: '💻', imageKey: 'field-software-engineering', palette: { primary: '#06B6D4', secondary: '#67E8F9', accent: '#06B6D4', surface: '#ECFEFF', gradient: ['#010E12', '#02161C', '#031E26'] }, simulator: { label: 'BUILD SIM', accent: '#06B6D4', soft: '#ECFEFF', border: '#A5F3FC' } },
  'cloud-devops': { id: 'cloud-devops', label: 'Cloud & DevOps', icon: '☁️', imageKey: 'field-cloud-devops', palette: { primary: '#0EA5E9', secondary: '#7DD3FC', accent: '#0EA5E9', surface: '#F0F9FF', gradient: ['#03111C', '#072036', '#0B2D4B'] }, simulator: { label: 'OPS SIM', accent: '#0EA5E9', soft: '#F0F9FF', border: '#BAE6FD' } },
  cybersecurity: { id: 'cybersecurity', label: 'Cybersecurity', icon: '🛡️', imageKey: 'field-cybersecurity', palette: { primary: '#EF4444', secondary: '#FCA5A5', accent: '#EF4444', surface: '#FEF2F2', gradient: ['#190405', '#2B080A', '#3B0D10'] }, simulator: { label: 'SECURITY SIM', accent: '#EF4444', soft: '#FEF2F2', border: '#FECACA' } },
  'data-science': { id: 'data-science', label: 'Data Science', icon: '🔬', imageKey: 'field-data-science', palette: { primary: '#8B5CF6', secondary: '#C4B5FD', accent: '#8B5CF6', surface: '#F5F3FF', gradient: ['#12061C', '#1E0C33', '#2B1450'] }, simulator: { label: 'DATA SCIENCE SIM', accent: '#8B5CF6', soft: '#F5F3FF', border: '#DDD6FE' } },
  'data-analysis-bi': { id: 'data-analysis-bi', label: 'Data Analysis & BI', icon: '📈', imageKey: 'field-data-analysis-bi', palette: { primary: '#F59E0B', secondary: '#FCD34D', accent: '#F59E0B', surface: '#FFFBEB', gradient: ['#120A00', '#1E1000', '#2A1600'] }, simulator: { label: 'BI SIM', accent: '#F59E0B', soft: '#FFFBEB', border: '#FDE68A' } },
  'data-engineering': { id: 'data-engineering', label: 'Data Engineering', icon: '🔩', imageKey: 'field-data-engineering', palette: { primary: '#38BDF8', secondary: '#7DD3FC', accent: '#38BDF8', surface: '#F0F9FF', gradient: ['#04111A', '#082132', '#0B3046'] }, simulator: { label: 'PIPELINE SIM', accent: '#38BDF8', soft: '#F0F9FF', border: '#BAE6FD' } },
  'supply-chain': { id: 'supply-chain', label: 'Supply Chain', icon: '🌐', imageKey: 'field-supply-chain', palette: { primary: '#10B981', secondary: '#6EE7B7', accent: '#10B981', surface: '#ECFDF5', gradient: ['#021208', '#041A0C', '#062012'] }, simulator: { label: 'OPS SIM', accent: '#10B981', soft: '#ECFDF5', border: '#A7F3D0' } },
  'product-design': { id: 'product-design', label: 'Product Design', icon: '🎨', imageKey: 'field-product-design', palette: { primary: '#EC4899', secondary: '#F9A8D4', accent: '#EC4899', surface: '#FDF2F8', gradient: ['#18040F', '#29081A', '#3A0D24'] }, simulator: { label: 'DESIGN SIM', accent: '#EC4899', soft: '#FDF2F8', border: '#FBCFE8' } },
  'digital-marketing': { id: 'digital-marketing', label: 'Digital Marketing', icon: '📣', imageKey: 'field-digital-marketing', palette: { primary: '#F43F5E', secondary: '#FDA4AF', accent: '#F43F5E', surface: '#FFF1F2', gradient: ['#180306', '#26070D', '#350B14'] }, simulator: { label: 'GROWTH SIM', accent: '#F43F5E', soft: '#FFF1F2', border: '#FECDD3' } },
  'fintech-blockchain': { id: 'fintech-blockchain', label: 'Fintech & Blockchain', icon: '🏦', imageKey: 'field-fintech-blockchain', palette: { primary: '#7C3AED', secondary: '#C4B5FD', accent: '#7C3AED', surface: '#F5F3FF', gradient: ['#10061E', '#1A0D32', '#26154B'] }, simulator: { label: 'FINTECH SIM', accent: '#7C3AED', soft: '#F5F3FF', border: '#DDD6FE' } },
  'renewable-energy': { id: 'renewable-energy', label: 'Renewable Energy', icon: '⚡', imageKey: 'field-renewable-energy', palette: { primary: '#EAB308', secondary: '#FDE047', accent: '#EAB308', surface: '#FEFCE8', gradient: ['#171100', '#2A1E00', '#3C2B00'] }, simulator: { label: 'ENERGY SIM', accent: '#EAB308', soft: '#FEFCE8', border: '#FEF08A' } },
  'project-management': { id: 'project-management', label: 'Project Management', icon: '📋', imageKey: 'field-project-management', palette: { primary: '#64748B', secondary: '#CBD5E1', accent: '#64748B', surface: '#F8FAFC', gradient: ['#0C1117', '#151D28', '#1E293B'] }, simulator: { label: 'PM SIM', accent: '#64748B', soft: '#F8FAFC', border: '#CBD5E1' } },
  'healthcare-nonclinical': { id: 'healthcare-nonclinical', label: 'Healthcare', icon: '⚕️', imageKey: 'field-healthcare-nonclinical', palette: { primary: '#EC4899', secondary: '#FDA4AF', accent: '#EC4899', surface: '#FDF2F8', gradient: ['#150510', '#220B19', '#321224'] }, simulator: { label: 'HEALTH SIM', accent: '#EC4899', soft: '#FDF2F8', border: '#FBCFE8' } },
  'legal-compliance': { id: 'legal-compliance', label: 'Legal & Compliance', icon: '⚖️', imageKey: 'field-legal-compliance', palette: { primary: '#F97316', secondary: '#FDBA74', accent: '#F97316', surface: '#FFF7ED', gradient: ['#1A0A03', '#2B1106', '#3D1809'] }, simulator: { label: 'COMPLIANCE SIM', accent: '#F97316', soft: '#FFF7ED', border: '#FED7AA' } },
  'human-resources': { id: 'human-resources', label: 'Human Resources', icon: '👥', imageKey: 'field-human-resources', palette: { primary: '#A855F7', secondary: '#D8B4FE', accent: '#A855F7', surface: '#FAF5FF', gradient: ['#13071D', '#1F0C2D', '#2C1340'] }, simulator: { label: 'PEOPLE SIM', accent: '#A855F7', soft: '#FAF5FF', border: '#E9D5FF' } },
  'sales-revenue': { id: 'sales-revenue', label: 'Sales & Revenue', icon: '💰', imageKey: 'field-sales-revenue', palette: { primary: '#EA580C', secondary: '#FDBA74', accent: '#EA580C', surface: '#FFF7ED', gradient: ['#190A03', '#2A1105', '#3A1808'] }, simulator: { label: 'SALES SIM', accent: '#EA580C', soft: '#FFF7ED', border: '#FED7AA' } },
  'writing-content': { id: 'writing-content', label: 'Writing & Content', icon: '✍️', imageKey: 'field-writing-content', palette: { primary: '#D97706', secondary: '#FCD34D', accent: '#D97706', surface: '#FFFBEB', gradient: ['#171000', '#261A00', '#352400'] }, simulator: { label: 'CONTENT SIM', accent: '#D97706', soft: '#FFFBEB', border: '#FDE68A' } },
  'creative-media': { id: 'creative-media', label: 'Creative Media', icon: '🎬', imageKey: 'field-creative-media', palette: { primary: '#F59E0B', secondary: '#FCD34D', accent: '#F59E0B', surface: '#FFFBEB', gradient: ['#170E00', '#271500', '#381D00'] }, simulator: { label: 'MEDIA SIM', accent: '#F59E0B', soft: '#FFFBEB', border: '#FDE68A' } },
  'specialized-engineering': { id: 'specialized-engineering', label: 'Engineering', icon: '⚙️', imageKey: 'field-specialized-engineering', palette: { primary: '#94A3B8', secondary: '#CBD5E1', accent: '#94A3B8', surface: '#F8FAFC', gradient: ['#0B1016', '#141B24', '#1D2733'] }, simulator: { label: 'ENGINEERING SIM', accent: '#94A3B8', soft: '#F8FAFC', border: '#CBD5E1' } },
  'real-estate': { id: 'real-estate', label: 'Real Estate', icon: '🏘️', imageKey: 'field-real-estate', palette: { primary: '#84CC16', secondary: '#BEF264', accent: '#84CC16', surface: '#F7FEE7', gradient: ['#101604', '#1A2406', '#263409'] }, simulator: { label: 'REAL ESTATE SIM', accent: '#84CC16', soft: '#F7FEE7', border: '#D9F99D' } },
  'education-technology': { id: 'education-technology', label: 'Education Technology', icon: '📚', imageKey: 'field-education-technology', palette: { primary: '#34D399', secondary: '#86EFAC', accent: '#34D399', surface: '#ECFDF5', gradient: ['#08150F', '#0D2419', '#123224'] }, simulator: { label: 'EDTECH SIM', accent: '#34D399', soft: '#ECFDF5', border: '#A7F3D0' } },
  'logistics-trade': { id: 'logistics-trade', label: 'Logistics & Trade', icon: '🚢', imageKey: 'field-logistics-trade', palette: { primary: '#10B981', secondary: '#6EE7B7', accent: '#10B981', surface: '#ECFDF5', gradient: ['#04130C', '#072016', '#0B2E20'] }, simulator: { label: 'TRADE SIM', accent: '#10B981', soft: '#ECFDF5', border: '#A7F3D0' } },
  'insurance-actuarial': { id: 'insurance-actuarial', label: 'Insurance & Actuarial', icon: '📉', imageKey: 'field-insurance-actuarial', palette: { primary: '#8B5CF6', secondary: '#C4B5FD', accent: '#8B5CF6', surface: '#F5F3FF', gradient: ['#12081D', '#1E0E2F', '#2A1544'] }, simulator: { label: 'ACTUARIAL SIM', accent: '#8B5CF6', soft: '#F5F3FF', border: '#DDD6FE' } },
  'public-sector-ngo': { id: 'public-sector-ngo', label: 'Public Sector & NGO', icon: '🏛️', imageKey: 'field-public-sector-ngo', palette: { primary: '#64748B', secondary: '#CBD5E1', accent: '#64748B', surface: '#F8FAFC', gradient: ['#0B1018', '#121B27', '#1A2737'] }, simulator: { label: 'IMPACT SIM', accent: '#64748B', soft: '#F8FAFC', border: '#CBD5E1' } },
  'agriculture-tech': { id: 'agriculture-tech', label: 'Agriculture Tech', icon: '🌱', imageKey: 'field-agriculture-tech', palette: { primary: '#22C55E', secondary: '#86EFAC', accent: '#22C55E', surface: '#F0FDF4', gradient: ['#061406', '#0B220B', '#123212'] }, simulator: { label: 'AGRI SIM', accent: '#22C55E', soft: '#F0FDF4', border: '#BBF7D0' } },
  'computational-science': { id: 'computational-science', label: 'Computational Science', icon: '🔭', imageKey: 'field-computational-science', palette: { primary: '#6366F1', secondary: '#A5B4FC', accent: '#6366F1', surface: '#EEF2FF', gradient: ['#0A0B19', '#11122B', '#191B3C'] }, simulator: { label: 'SCIENCE SIM', accent: '#6366F1', soft: '#EEF2FF', border: '#C7D2FE' } },
  starknet: { id: 'starknet', label: 'Starknet', icon: '⚡', imageKey: 'field-starknet', palette: { primary: '#EC4899', secondary: '#F9A8D4', accent: '#EC4899', surface: '#FDF2F8', gradient: ['#18040F', '#29081A', '#3A0D24'] }, simulator: { label: 'STARKNET LIVE', accent: '#EC4899', soft: '#FDF2F8', border: '#FBCFE8' } },
};

export function getFieldVisualTheme(fieldId?: string | null): FieldVisualTheme {
  return FIELD_VISUALS[fieldId ?? ''] ?? {
    id: fieldId ?? 'default',
    label: 'Sifter',
    icon: '⚡',
    imageKey: 'field-default',
    palette: { primary: '#5B5FCF', secondary: '#A5B4FC', accent: '#5B5FCF', surface: '#EEF2FF', gradient: ['#05030F', '#0D0A25', '#161240'] },
    simulator: { label: 'SIFTER SKILL_UP', accent: '#5B5FCF', soft: '#EEF2FF', border: '#C7D2FE' },
  };
}

export function getTrackVisualTheme(trackId: string, fieldId?: string | null, trackName?: string | null): TrackVisualTheme {
  const fieldTheme = getFieldVisualTheme(fieldId);
  return {
    id: trackId,
    fieldId: fieldTheme.id,
    label: trackName || fieldTheme.label,
    icon: fieldTheme.icon,
    imageKey: `track-${trackId}`,
    palette: fieldTheme.palette,
    simulator: fieldTheme.simulator,
  };
}

export function getIslandVisualTheme(islandId: number): IslandVisualTheme {
  const island = ISLANDS.find((entry) => entry.id === islandId);
  const primary = island?.color ?? '#5B5FCF';
  return {
    id: islandId,
    label: island?.name ?? `Island ${islandId}`,
    icon: island?.icon ?? '⚡',
    imageKey: `island-${islandId}`,
    tier: island?.tier ?? 'beginner',
    palette: {
      primary,
      secondary: `${primary}AA`,
      accent: primary,
      surface: `${primary}12`,
      gradient: [`${primary}22`, `${primary}10`, '#FFFFFF'],
    },
    simulator: {
      label: island?.name?.toUpperCase() ?? `ISLAND ${islandId}`,
      accent: primary,
      soft: `${primary}12`,
      border: `${primary}40`,
    },
  };
}

export function getSimulatorVisualTheme(input: { fieldId?: string | null; islandId?: number | null; label?: string | null }): SimulatorVisualTheme {
  if (input.islandId) {
    const islandTheme = getIslandVisualTheme(input.islandId);
    return {
      label: input.label || islandTheme.simulator.label,
      accent: islandTheme.simulator.accent,
      soft: islandTheme.simulator.soft,
      border: islandTheme.simulator.border,
    };
  }
  const fieldTheme = getFieldVisualTheme(input.fieldId);
  return {
    label: input.label || fieldTheme.simulator.label,
    accent: fieldTheme.simulator.accent,
    soft: fieldTheme.simulator.soft,
    border: fieldTheme.simulator.border,
  };
}

export function getFieldGradient(fieldId?: string | null): [string, string, string] {
  return getFieldVisualTheme(fieldId).palette.gradient;
}

export function getFieldColor(fieldId?: string | null): string {
  return getFieldVisualTheme(fieldId).palette.primary;
}

export function getFieldIcon(fieldId?: string | null): string {
  return getFieldVisualTheme(fieldId).icon;
}
