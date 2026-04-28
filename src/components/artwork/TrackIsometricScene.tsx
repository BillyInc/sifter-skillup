import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Polygon,
  Polyline,
  Text as SvgText,
} from 'react-native-svg';
import { getAllFieldDetails } from '../../data/fieldDetails';
import { getAllTracks } from '../../data/tracks';

const CX = 280, CY = 265, SC = 108, HS = 158;

function iso(x: number, y: number, z: number) {
  return {
    sx: CX + (x - z) * SC,
    sy: CY - y * HS + (x + z) * SC * 0.5,
  };
}

function hexDarken(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((n >> 16) & 255) - amt);
  const g = Math.max(0, ((n >> 8) & 255) - amt);
  const b = Math.max(0, (n & 255) - amt);
  return `rgb(${r},${g},${b})`;
}

function isoBox(
  cx: number, cz: number, h: number,
  w: number, d: number, col: string
) {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const z0 = cz - d / 2, z1 = cz + d / 2;
  const corners = (y: number) => [
    iso(x0, y, z1), iso(x1, y, z1), iso(x1, y, z0), iso(x0, y, z0),
  ];
  const [bl, br, fr, fl] = corners(0);
  const [tbl, tbr, tfr, tfl] = corners(h);
  const pts = (arr: { sx: number; sy: number }[]) =>
    arr.map(p => `${p.sx},${p.sy}`).join(' ');
  return { bl, br, fr, fl, tbl, tbr, tfr, tfl, pts, col };
}

interface SectorDef {
  label: string;
  height: number;
  color: string;
  annotation?: string;
}

interface TrackIsometricSceneProps {
  sectors: SectorDef[];
  accentColor: string;
  width?: number;
  height?: number;
}

interface TrackSceneProps {
  trackId: string;
  accentColor: string;
  width?: number;
  height?: number;
}

type TrackIsometricSceneInternalProps = TrackIsometricSceneProps & {
  footerLabel?: string;
};

const VIEWBOX_WIDTH = 560;
const VIEWBOX_HEIGHT = 300;
const GRID_VALUES = [0, 0.25, 0.5, 0.75, 1.0];
const POSITIONS = [
  { cx: 0.18, cz: 0.22 },
  { cx: 0.72, cz: 0.18 },
  { cx: 0.52, cz: 0.50 },
  { cx: 0.22, cz: 0.70 },
  { cx: 0.78, cz: 0.60 },
] as const;

const QUANT_SCENE: SectorDef[] = [
  { label: 'Derivatives', height: 0.88, color: '#1D4ED8', annotation: 'Full mastery' },
  { label: 'HFT', height: 0.65, color: '#2563EB', annotation: 'Latency maps' },
  { label: 'Portfolio', height: 0.72, color: '#3B82F6', annotation: 'Risk models' },
  { label: 'Backtesting', height: 0.55, color: '#60A5FA', annotation: '12 runs' },
  { label: 'Risk Mgmt', height: 0.42, color: '#93C5FD' },
];

const SUPPLY_SCENE: SectorDef[] = [
  { label: 'Procurement', height: 0.77, color: '#0EA5E9', annotation: 'Sourcing ops' },
  { label: 'Logistics', height: 0.68, color: '#0284C7', annotation: 'Route maps' },
  { label: 'Inventory', height: 0.55, color: '#0369A1', annotation: 'Stock models' },
  { label: 'Distribution', height: 0.45, color: '#38BDF8' },
  { label: 'Analytics', height: 0.60, color: '#7DD3FC' },
];

const ONCHAIN_SCENE: SectorDef[] = [
  { label: 'Wallet Flows', height: 0.83, color: '#3B82F6', annotation: 'Smart money' },
  { label: 'Protocol Maps', height: 0.70, color: '#2563EB', annotation: 'TVL tracked' },
  { label: 'MEV', height: 0.60, color: '#1D4ED8', annotation: 'Sandwich ops' },
  { label: 'Bridge Activity', height: 0.50, color: '#60A5FA' },
  { label: 'On-chain Signals', height: 0.40, color: '#93C5FD' },
];

const DEFI_SCENE: SectorDef[] = [
  { label: 'Yield Strategy', height: 0.80, color: '#10B981', annotation: 'APR 24.3%' },
  { label: 'Governance', height: 0.60, color: '#059669', annotation: 'Proposals' },
  { label: 'Liquidity', height: 0.72, color: '#34D399', annotation: 'Pool depth' },
  { label: 'Cross-Chain', height: 0.50, color: '#6EE7B7' },
  { label: 'Risk Framework', height: 0.65, color: '#A7F3D0' },
];

const CAIRO_SCENE: SectorDef[] = [
  { label: 'Smart Contracts', height: 0.85, color: '#F59E0B', annotation: '4 deployed' },
  { label: 'Cairo Syntax', height: 0.70, color: '#D97706', annotation: 'Felts & arrays' },
  { label: 'Starknet Calls', height: 0.60, color: '#FBBF24', annotation: 'Sepolia live' },
  { label: 'Storage', height: 0.45, color: '#FCD34D' },
  { label: 'Testing', height: 0.55, color: '#FDE68A' },
];

const STARKNET_DEFI_SCENE: SectorDef[] = [
  { label: 'Pool Depth', height: 0.78, color: '#EC4899', annotation: 'JediSwap' },
  { label: 'Yield Monitor', height: 0.65, color: '#DB2777', annotation: 'Live APR' },
  { label: 'StarkZap', height: 0.82, color: '#F472B6', annotation: 'Live txns' },
  { label: 'Bridge', height: 0.50, color: '#FBCFE8' },
  { label: 'Governance', height: 0.40, color: '#FCE7F3' },
];

const SECURITY_SCENE: SectorDef[] = [
  { label: 'Recon', height: 0.88, color: '#EF4444', annotation: 'Attack surface' },
  { label: 'Exploit Dev', height: 0.72, color: '#DC2626', annotation: 'PoC ready' },
  { label: 'Reporting', height: 0.60, color: '#F87171', annotation: 'Severity: High' },
  { label: 'Triage', height: 0.50, color: '#FCA5A5' },
  { label: 'Disclosure', height: 0.42, color: '#FECACA' },
];

const CRYPTO_SCENE: SectorDef[] = [
  { label: 'Bitcoin Bay', height: 0.95, color: '#F7931A', annotation: '15/15 done' },
  { label: 'Ethereum', height: 0.80, color: '#627EEA', annotation: '12/15 done' },
  { label: 'DeFi Universe', height: 0.33, color: '#10B981', annotation: '5/15 done' },
  { label: 'Bridges & L2s', height: 0.0, color: '#06B6D4' },
  { label: 'Starknet World', height: 0.10, color: '#EC4899' },
];

const STARKNET_ISLANDS_SCENE: SectorDef[] = [
  { label: 'Wallet Ops', height: 0.62, color: '#EC4899', annotation: 'Braavos ready' },
  { label: 'Swaps', height: 0.72, color: '#F472B6', annotation: 'Gasless flow' },
  { label: 'Staking', height: 0.56, color: '#FB7185', annotation: 'Live STRK' },
  { label: 'Lending', height: 0.48, color: '#FDA4AF' },
  { label: 'DCA', height: 0.66, color: '#FBCFE8' },
];

const STARKNET_ECOSYSTEM_SCENE: SectorDef[] = [
  { label: 'Protocols', height: 0.82, color: '#6366F1', annotation: 'Ecosystem map' },
  { label: 'Governance', height: 0.58, color: '#8B5CF6', annotation: 'Forum signals' },
  { label: 'Users', height: 0.64, color: '#A78BFA', annotation: 'Wallet activity' },
  { label: 'TVL', height: 0.46, color: '#C4B5FD' },
  { label: 'Grant Ops', height: 0.40, color: '#DDD6FE' },
];

const SOFTWARE_SCENE: SectorDef[] = [
  { label: 'Frontend', height: 0.74, color: '#0EA5E9', annotation: 'UI systems' },
  { label: 'Backend', height: 0.84, color: '#0284C7', annotation: 'API layers' },
  { label: 'Data', height: 0.58, color: '#38BDF8', annotation: 'Pipelines' },
  { label: 'Infra', height: 0.68, color: '#7DD3FC' },
  { label: 'Quality', height: 0.46, color: '#BAE6FD' },
];

const AI_SCENE: SectorDef[] = [
  { label: 'Models', height: 0.86, color: '#3B82F6', annotation: 'Inference stack' },
  { label: 'Pipelines', height: 0.65, color: '#2563EB', annotation: 'Training loops' },
  { label: 'Evaluation', height: 0.58, color: '#60A5FA', annotation: 'Benchmarks' },
  { label: 'Data Ops', height: 0.50, color: '#93C5FD' },
  { label: 'Safety', height: 0.42, color: '#BFDBFE' },
];

const MEMECOIN_SCENE: SectorDef[] = [
  { label: 'Launches', height: 0.78, color: '#F59E0B', annotation: 'Curve watch' },
  { label: 'Wallet Clusters', height: 0.60, color: '#D97706', annotation: 'Bundle scan' },
  { label: 'Liquidity', height: 0.55, color: '#FBBF24', annotation: 'Exit paths' },
  { label: 'Narratives', height: 0.44, color: '#FCD34D' },
  { label: 'Risk Flags', height: 0.68, color: '#F97316' },
];

const FUTURES_SCENE: SectorDef[] = [
  { label: 'Perps', height: 0.82, color: '#10B981', annotation: 'Funding edge' },
  { label: 'Open Interest', height: 0.66, color: '#059669', annotation: 'Positioning' },
  { label: 'Liquidations', height: 0.58, color: '#34D399', annotation: 'Heat map' },
  { label: 'Basis', height: 0.48, color: '#6EE7B7' },
  { label: 'Risk', height: 0.52, color: '#A7F3D0' },
];

const PRIMARY_TRACK_SCENES: Record<string, SectorDef[]> = {
  'quant-trader': QUANT_SCENE,
  'supply-chain-analyst': SUPPLY_SCENE,
  'onchain-analyst': ONCHAIN_SCENE,
  'defi-researcher': DEFI_SCENE,
  'defi-research-analyst': DEFI_SCENE,
  'cairo-builder': CAIRO_SCENE,
  'starknet-defi-navigator': STARKNET_DEFI_SCENE,
  'bug-bounty-hunter': SECURITY_SCENE,
  'crypto': CRYPTO_SCENE,
  'starknet-islands': STARKNET_ISLANDS_SCENE,
  'starknet-island': STARKNET_ISLANDS_SCENE,
  'starknet-ecosystem-deep-dive': STARKNET_ECOSYSTEM_SCENE,
  'software-engineering': SOFTWARE_SCENE,
  'software-engineer': SOFTWARE_SCENE,
  'quant-developer': QUANT_SCENE,
  'quant-researcher': QUANT_SCENE,
  'quant-trading': QUANT_SCENE,
  'supply-chain-analyst-sc': SUPPLY_SCENE,
  'onchain-sleuth': ONCHAIN_SCENE,
  'memecoin-trader': MEMECOIN_SCENE,
  'futures-trading': FUTURES_SCENE,
};

function titleFromTrackId(trackId: string): string {
  return trackId
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function resolveSceneForTrack(meta: {
  trackId: string;
  trackName?: string;
  fieldId?: string;
  worldThemeId?: string;
}): SectorDef[] | undefined {
  const id = meta.trackId;
  const name = (meta.trackName ?? '').toLowerCase();

  if (PRIMARY_TRACK_SCENES[id]) return PRIMARY_TRACK_SCENES[id];

  if (id.includes('starknet-island') || id.includes('starknet-islands')) return STARKNET_ISLANDS_SCENE;
  if (id.includes('cairo')) return CAIRO_SCENE;
  if (id.includes('starknet-defi')) return STARKNET_DEFI_SCENE;
  if (id.includes('starknet') && id.includes('ecosystem')) return STARKNET_ECOSYSTEM_SCENE;
  if (id.includes('starknet')) return STARKNET_ISLANDS_SCENE;

  if (
    meta.fieldId === 'quant' ||
    meta.worldThemeId === 'quant-quarter' ||
    id.includes('quant') ||
    id.includes('futures') ||
    id.includes('options') ||
    id.includes('portfolio') ||
    id.includes('actuarial') ||
    id.includes('risk-analyst-quant') ||
    name.includes('quant')
  ) return QUANT_SCENE;

  if (
    meta.fieldId === 'supply-chain' ||
    meta.fieldId === 'logistics-trade' ||
    meta.worldThemeId === 'logistics-labyrinth' ||
    id.includes('supply') ||
    id.includes('logistics') ||
    id.includes('freight') ||
    id.includes('customs') ||
    id.includes('trade-compliance') ||
    name.includes('supply chain')
  ) return SUPPLY_SCENE;

  if (
    id.includes('defi') ||
    name.includes('defi')
  ) return DEFI_SCENE;

  if (
    meta.fieldId === 'crypto' ||
    meta.worldThemeId === 'blockchain-borough' ||
    id.includes('crypto') ||
    id.includes('memecoin') ||
    id.includes('tokenomics') ||
    id.includes('governance') ||
    id.includes('web3') ||
    id.includes('blockchain')
  ) {
    if (id.includes('onchain') || id.includes('sleuth') || name.includes('on-chain')) return ONCHAIN_SCENE;
    if (id.includes('meme')) return MEMECOIN_SCENE;
    return CRYPTO_SCENE;
  }

  if (
    meta.fieldId === 'ai-ml' ||
    meta.fieldId === 'data-science' ||
    meta.fieldId === 'computational-science' ||
    meta.worldThemeId === 'neural-nexus' ||
    id.includes('ai') ||
    id.includes('ml') ||
    id.includes('llm') ||
    id.includes('nlp') ||
    id.includes('vision') ||
    id.includes('bioinformatics') ||
    id.includes('comp-')
  ) return AI_SCENE;

  if (
    meta.fieldId === 'software-engineering' ||
    meta.fieldId === 'cloud-devops' ||
    meta.worldThemeId === 'code-citadel' ||
    meta.worldThemeId === 'sky-forge' ||
    id.includes('software') ||
    id.includes('frontend') ||
    id.includes('backend') ||
    id.includes('mobile') ||
    id.includes('devops') ||
    id.includes('cloud') ||
    id.includes('k8s') ||
    id.includes('terraform') ||
    id.includes('game-developer') ||
    id.includes('qa-engineer')
  ) return SOFTWARE_SCENE;

  if (
    meta.fieldId === 'cybersecurity' ||
    meta.worldThemeId === 'shadow-vault' ||
    id.includes('security') ||
    id.includes('audit') ||
    id.includes('hunter') ||
    id.includes('soc-') ||
    id.includes('pen-') ||
    id.includes('appsec') ||
    id.includes('dfir')
  ) return SECURITY_SCENE;

  return undefined;
}

function buildTrackScenes(): Record<string, SectorDef[]> {
  const map: Record<string, SectorDef[]> = { ...PRIMARY_TRACK_SCENES };

  for (const detail of getAllFieldDetails()) {
    for (const track of [...detail.generalTracks, ...detail.specificTracks]) {
      if (!map[track.id]) {
        const scene = resolveSceneForTrack({
          trackId: track.id,
          trackName: track.name,
          fieldId: detail.fieldId,
          worldThemeId: track.worldThemeId,
        });
        if (scene) map[track.id] = scene;
      }
    }
  }

  for (const track of getAllTracks()) {
    if (!map[track.id]) {
      const scene = resolveSceneForTrack({
        trackId: track.id,
        trackName: track.name,
        fieldId: track.fieldId,
      });
      if (scene) map[track.id] = scene;
    }
  }

  return map;
}

export const TRACK_SCENES: Record<string, SectorDef[]> = buildTrackScenes();

export function TrackIsometricScene({
  sectors,
  accentColor,
  width = 560,
  height = 300,
  footerLabel,
}: TrackIsometricSceneInternalProps) {
  const visibleSectors = sectors.slice(0, 5);
  const footer = footerLabel ?? accentColor;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}>
      <Defs>
        <LinearGradient id="isoBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#060d1f" />
          <Stop offset="50%" stopColor="#0d1b3e" />
          <Stop offset="100%" stopColor="#130824" />
        </LinearGradient>
      </Defs>

      <Rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="url(#isoBg)" />

      {GRID_VALUES.map(v => {
        const a = iso(0, 0, v);
        const b = iso(1, 0, v);
        return (
          <Polyline
            key={`hz-${v}`}
            points={`${a.sx},${a.sy} ${b.sx},${b.sy}`}
            stroke="rgba(100,160,255,0.10)"
            strokeWidth={0.8}
            fill="none"
          />
        );
      })}

      {GRID_VALUES.map(v => {
        const a = iso(v, 0, 0);
        const b = iso(v, 0, 1);
        return (
          <Polyline
            key={`vt-${v}`}
            points={`${a.sx},${a.sy} ${b.sx},${b.sy}`}
            stroke="rgba(100,160,255,0.10)"
            strokeWidth={0.8}
            fill="none"
          />
        );
      })}

      {visibleSectors.map((sector, index) => {
        const pos = POSITIONS[index];
        const h = 0.3 + sector.height * 0.65;
        const box = isoBox(pos.cx, pos.cz, h, 0.22, 0.20, sector.color);
        const leftPoints = box.pts([box.tbl, box.bl, box.fl, box.tfl]);
        const rightPoints = box.pts([box.tbr, box.br, box.fr, box.tfr]);
        const topPoints = box.pts([box.tbl, box.tbr, box.tfr, box.tfl]);
        const edgePoints = [box.tbl, box.tbr, box.tfr, box.tfl, box.tbl]
          .map(p => `${p.sx},${p.sy}`)
          .join(' ');

        const calloutWidth = clamp(76 + Math.max(sector.annotation?.length ?? 0, sector.label.length) * 4, 92, 168);
        const calloutHeight = sector.label ? 34 : 20;
        const calloutX = clamp(box.tbl.sx - 8, 8, VIEWBOX_WIDTH - calloutWidth - 8);
        const calloutY = clamp(box.tbl.sy - 42, 8, VIEWBOX_HEIGHT - calloutHeight - 8);

        return (
          <React.Fragment key={`${sector.label}-${index}`}>
            <Polygon points={leftPoints} fill={hexDarken(sector.color, 45)} opacity={0.95} />
            <Polygon points={rightPoints} fill={hexDarken(sector.color, 22)} opacity={0.95} />
            <Polygon points={topPoints} fill={sector.color} opacity={0.97} />
            <Polyline
              points={edgePoints}
              stroke={accentColor}
              strokeWidth={1.4}
              fill="none"
              opacity={0.6}
            />

            {sector.annotation ? (
              <>
                <Rect
                  x={calloutX}
                  y={calloutY}
                  width={calloutWidth}
                  height={calloutHeight}
                  rx={4}
                  fill="rgba(8,14,38,0.85)"
                  stroke={`${sector.color}40`}
                  strokeWidth={1}
                />
                <SvgText
                  x={calloutX + 8}
                  y={calloutY + 13}
                  fontSize={10}
                  fontWeight="700"
                  fill={sector.color}
                >
                  {sector.annotation}
                </SvgText>
                <SvgText
                  x={calloutX + 8}
                  y={calloutY + 26}
                  fontSize={9}
                  fill="rgba(200,220,255,0.5)"
                >
                  {sector.label}
                </SvgText>
              </>
            ) : null}
          </React.Fragment>
        );
      })}

      <SvgText
        x={14}
        y={VIEWBOX_HEIGHT - 10}
        fontSize={9}
        fill="rgba(190,210,255,0.35)"
        fontFamily="monospace"
      >
        {`SECTOR MAP · ${footer}`}
      </SvgText>
    </Svg>
  );
}

export default function TrackScene({
  trackId,
  accentColor,
  width = 560,
  height = 300,
}: TrackSceneProps) {
  const sectors = TRACK_SCENES[trackId];
  const footerLabel = titleFromTrackId(trackId);

  if (!sectors) {
    return (
      <TrackIsometricScene
        sectors={[
          { label: 'Foundation', height: 0.6, color: accentColor },
          { label: 'Advanced', height: 0.4, color: `${accentColor}CC` },
          { label: 'Expert', height: 0.8, color: `${accentColor}AA` },
        ]}
        accentColor={accentColor}
        width={width}
        height={height}
        footerLabel={footerLabel}
      />
    );
  }

  return (
    <TrackIsometricScene
      sectors={sectors}
      accentColor={accentColor}
      width={width}
      height={height}
      footerLabel={footerLabel}
    />
  );
}
