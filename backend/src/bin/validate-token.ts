import { is } from 'typescript-is';
import { Token } from './token';

export function validateToken(tokenObj: any): Token | null {
  if (!is<Token>(tokenObj)) {
    return null;
  }
  const token: Token = tokenObj;

  if (new Date() > new Date(token.expiredAt)) {
    return null;
  }

  return token;
}
