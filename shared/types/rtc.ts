import { AudioState } from './AudioState';
import { PlayerData } from './PlayerData';

export interface TurnUserData {
  username: string;
  password: string;
}

export interface RTCConnData {
  polite: boolean;
  turnUser: TurnUserData;
  audioState: AudioState;
  to: {
    player: PlayerData;
    socketId: string;
  };
}
