import { hasOwnProperty } from '../util';
import { ForEachCallback, TwoKeyMap } from './TwoKeyMap';

export class NestedMap<T> extends TwoKeyMap<T> {
  set(key1: string, key2: string, val: T): void {
    if (!hasOwnProperty(this.map, key1)) {
      this.map[key1] = {};
    }
    this.map[key1][key2] = val;
  }

  unset(key1: string, key2?: string): void {
    if (key2 === undefined) {
      delete this.map[key1];
    } else {
      if (hasOwnProperty(this.map, key1)) {
        delete this.map[key1][key2];
      }
    }
  }

  forEach(arg0: string | ForEachCallback<T>, cb?: ForEachCallback<T>) {
    if (cb === undefined) {
      cb = arg0 as ForEachCallback<T>;
    }

    for (const key1 of typeof arg0 === 'string' ? [arg0] : this.getKeys()) {
      for (const key2 of this.getKeys(key1)) {
        cb(this.map[key1][key2], key1, key2);
      }
    }
  }
}
