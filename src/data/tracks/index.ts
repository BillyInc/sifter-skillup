export interface TrackInfo {
  id: string;
  name: string;
  description: string;
  loader: () => Promise<any>;
}

const tracks: TrackInfo[] = [
  {
    id: 'supply-chain',
    name: 'Supply Chain Analyst',
    description: 'Supply chain management, logistics, and procurement',
    loader: () => import('./supplyChainTrack'),
  },
];

export function getTrackById(id: string): TrackInfo | undefined {
  return tracks.find(t => t.id === id);
}

export function getAllTracks(): TrackInfo[] {
  return tracks;
}
