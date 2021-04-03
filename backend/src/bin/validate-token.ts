export function validateToken(token: any) {
  if (
    !token ||
    typeof token.uuid !== 'string' ||
    !(new Date() < new Date(token.expiredAt))
  ) {
    return false;
  }

  return true;
}
