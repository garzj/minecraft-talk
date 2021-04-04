import { JSONCookie, signedCookie } from 'cookie-parser';
import { Router } from 'express';
import { Token } from '../../bin/Token';
import { validateToken } from '../../bin/validate-token';

export const loginRouter = Router();

loginRouter.get('/login', (req, res) => {
  if (typeof req.query.token !== 'string') {
    // There's no new token
    return res.redirect('/');
  }

  const unsignedToken = signedCookie(req.query.token, process.env.TOKEN_SECRET);
  if (!unsignedToken) {
    // The user modified the new token
    return res.redirect('/');
  }

  const tokenObj: any = JSONCookie(unsignedToken);
  if (!validateToken(tokenObj)) {
    return res.redirect('/');
  }
  const token: Token = tokenObj;

  // ! Don't refresh this token, otherwise one could do this infinitely

  res.cookie('token', token, { signed: true }).redirect('/');
});
