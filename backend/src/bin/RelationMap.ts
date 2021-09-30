import { hasOwnProperty } from './helpers';

export class RelationMap<T> {
  private map: Record<string, Record<string, T>> = {};

  set(key1: string, key2: string, val: T): void {
    if (!hasOwnProperty(this.map, key1)) {
      this.map[key1] = {};
    }
    this.map[key1][key2] = val;

    if (!hasOwnProperty(this.map, key2)) {
      this.map[key2] = {};
    }
    this.map[key2][key1] = val;
  }

  hasKey(key1: string, key2?: string): boolean {
    const hasKey1 = hasOwnProperty(this.map, key1);

    if (key2 === undefined) return hasKey1;

    return hasKey1 && hasOwnProperty(this.map[key1], key2);
  }

  getKeys(): string[];
  getKeys(key: string): string[] | undefined;
  getKeys(key?: string): string[] | undefined {
    if (key === undefined) {
      return Object.keys(this.map);
    }
    if (hasOwnProperty(this.map, key)) {
      return Object.keys(this.map[key]);
    }
    return undefined;
  }

  getValues(): T[];
  getValues(key: string): T[] | undefined;
  getValues(key?: string): T[] | undefined {
    if (key === undefined) {
      const vals: T[] = [];

      const maps = Object.values(this.map);
      for (let map of maps) {
        vals.push(...Object.values(map));
      }

      return vals;
    }
    if (hasOwnProperty(this.map, key)) {
      return Object.values(this.map[key]);
    }
    return undefined;
  }

  get(key1: string): Readonly<Record<string, T>> | undefined;
  get(key1: string, key2: string): T | undefined;
  get(
    key1: string,
    key2?: string
  ): Readonly<Record<string, T>> | T | undefined {
    if (key2 === undefined) {
      return this.map[key1];
    }

    return this.map[key1]?.[key2];
  }

  unset(key1: string, key2?: string): void {
    if (key2 === undefined) {
      const key2s = Object.keys(this.map[key1]);
      delete this.map[key1];

      for (let key2 of key2s) {
        delete this.map[key2][key1];
      }
    } else {
      if (hasOwnProperty(this.map, key1)) {
        delete this.map[key1][key2];
      }

      if (hasOwnProperty(this.map, key2)) {
        delete this.map[key2][key1];
      }
    }
  }
}
