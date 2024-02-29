import { PlayerData } from './PlayerData';

export interface TurnUserData {
  username: string;
  password: string;
}

export interface RTCConnData {
  polite: boolean;
  turnUser: TurnUserData;
  volume: number;
  to: {
    player: PlayerData;
    socketId: string;
  };
}
