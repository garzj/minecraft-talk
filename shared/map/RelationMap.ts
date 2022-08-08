import { hasOwnProperty } from '@shared/util';
import { ForEachCallback, TwoKeyMap } from '@shared/map/TwoKeyMap';

export class RelationMap<T> extends TwoKeyMap<T> {
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

  unset(key1: string, key2?: string): void {
    if (key2 === undefined) {
      let key2s: string[] = [];
      if (hasOwnProperty(this.map, key1)) {
        key2s = Object.keys(this.map[key1]);
      }
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

  forEach(arg0: string | ForEachCallback<T>, cb?: ForEachCallback<T>) {
    if (cb === undefined) {
      cb = arg0 as ForEachCallback<T>;
    }

    const keysPassed = new Set<string>();
    for (const key1 of typeof arg0 === 'string' ? [arg0] : this.getKeys()) {
      for (const key2 of this.getKeys(key1)) {
        if (!keysPassed.has(key2)) {
          cb(this.map[key1][key2], key1, key2);
        }
      }

      keysPassed.add(key1);
    }
  }
}
