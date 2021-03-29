import { PlayerConnection } from './PlayerConnection';

export interface PlayerConnections {
  [uuid: string]: PlayerConnection[];
}
