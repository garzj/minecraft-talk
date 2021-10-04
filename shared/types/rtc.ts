import { PlayerData } from './PlayerData';

export interface TurnUserData {
  username: string;
  password: string;
}

export interface RTCSetupData {
  turnUser: TurnUserData;
  volume: number;
  to: {
    playerData: PlayerData;
    socketId: string;
  };
}
