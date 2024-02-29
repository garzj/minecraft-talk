export interface AudioState {
  volume: number;
  origin?: [number, number, number];
}

export function defaultAudioState(): AudioState {
  return { volume: 0 };
}
