import { hasOwnProperty } from '../util';

export type ForEachCallback<T> = (value: T, key1: string, key2: string) => void;

export abstract class TwoKeyMap<T> {
  protected map: Record<string, Record<string, T>> = {};

  abstract set?(key1: string, key2: string, val: T): void;

  abstract unset?(key1: string, key2?: string): void;

  abstract forEach(cb: ForEachCallback<T>): void;
  abstract forEach(key1: string, cb: ForEachCallback<T>): void;

  hasKey(key1: string, key2?: string): boolean {
    const hasKey1 = hasOwnProperty(this.map, key1);

    if (key2 === undefined) return hasKey1;

    return hasKey1 && hasOwnProperty(this.map[key1], key2);
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

  getKeys(): string[];
  getKeys(key: string): string[];
  getKeys(key?: string): string[] {
    if (key === undefined) {
      return Object.keys(this.map);
    }
    if (hasOwnProperty(this.map, key)) {
      return Object.keys(this.map[key]);
    }
    return [];
  }

  getValues(): T[];
  getValues(key: string): T[];
  getValues(key?: string): T[] {
    const values: T[] = [];
    if (key === undefined) {
      this.forEach((value) => values.push(value));
    } else {
      this.forEach(key, (value) => values.push(value));
    }
    return values;
  }
}
