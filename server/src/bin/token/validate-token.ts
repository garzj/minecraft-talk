import { Token, tokenSchema } from './Token';

export function validateToken(tokenObj: any): Token | null {
  const result = tokenSchema.safeParse(tokenObj);
  if (!result.success) return null;
  const token = result.data;

  if (new Date() > new Date(token.expiredAt)) return null;

  return token;
}
