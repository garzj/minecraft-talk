import { JSONCookie, signedCookie } from 'cookie-parser';
import { Router } from 'express';
import { Token } from '../../bin/token/Token';
import { validateToken } from '../../bin/token/validate-token';

export const loginRouter = Router();

loginRouter.get('/login', (req, res) => {
  if (typeof req.query.t !== 'string') {
    // There's no new token
    return res.redirect('/');
  }

  const decodedToken = Buffer.from(req.query.t, 'base64').toString();
  const unsignedToken = signedCookie(decodedToken, process.env.TOKEN_SECRET);
  if (!unsignedToken) {
    // The user modified the new token
    return res.redirect('/');
  }

  const tokenObj: any = JSONCookie(unsignedToken);
  if (!validateToken(tokenObj)) {
    return res.redirect('/');
  }
  const token: Token = tokenObj;

  res.cookie('token', token, { signed: true }).redirect('/');
});
