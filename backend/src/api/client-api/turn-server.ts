import { randomBytes } from 'crypto';
import Turn = require('node-turn');

export interface TurnUser {
  username: string;
  password: string;
}

const turnCreds: Map<string, string> = new Map();

const turnServer = new Turn({
  listeningPort: 3478,
  debugLevel: 'ERROR',
  authMech: 'short-term',
});
turnServer.start();

export function getTurnUser(username: string) {
  const password = turnCreds.get(username);
  if (password !== undefined) {
    return { username, password };
  }

  return null;
}

export function genTurnUser(username: string) {
  const user = getTurnUser(username);
  if (user) return user;

  const password = randomBytes(15).toString('hex');
  turnServer.addUser(username, password);
  turnCreds.set(username, password);
  return { username, password };
}

export function dropTurnUser(username: string) {
  turnServer.removeUser(username);
}
