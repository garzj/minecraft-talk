export function clearCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export function cookieExists(name: string): boolean {
  return document.cookie
    .split('; ')
    .map((c) => c.split('=')[0])
    .includes(name);
}
