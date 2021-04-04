import { Token, tokenSchema } from './Token';

export function validateToken(tokenObj: any): Token | null {
  const result = tokenSchema.validate(tokenObj);
  if (result.error) {
    return null;
  }
  const token: Token = result.value;

  if (new Date() > new Date(token.expiredAt)) {
    return null;
  }

  return token;
}
