import { Token } from '@/bin/token/Token';
import { validateToken } from '@/bin/token/validate-token';
import * as cookieParser from 'cookie-parser';
import { Socket } from 'socket.io';

export function clientAPIAuthenticator(socket: Socket): Token | null {
  const req: any = socket.request;
  cookieParser(process.env.TOKEN_SECRET)(req, {} as any, () => {});
  const token: Token | null = validateToken(req.signedCookies.token);
  return token;
}
