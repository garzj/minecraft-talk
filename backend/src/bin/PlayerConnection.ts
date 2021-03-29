export class PlayerConnection {
  uuids: Set<string>;
  vol: number;

  constructor(uuid1: string, uuid2: string, vol: number) {
    this.uuids = new Set([uuid1, uuid2]);
    this.vol = vol;
  }
}
