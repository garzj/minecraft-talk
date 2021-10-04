export function hasOwnProperty(obj: object, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function shortenUuid(uuid: string): string {
  return uuid.replace(/-/g, '');
}
