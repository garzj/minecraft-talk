import { JSONCookie, signedCookie } from 'cookie-parser';
import { Router } from 'express';

export const loginRouter = Router();

loginRouter.get('/login', (req, res) => {
  if (typeof req.query.token !== 'string') {
    // There's no token
    return res.redirect('/expired');
  }

  const unsignedToken = signedCookie(req.query.token, process.env.TOKEN_SECRET);
  if (!unsignedToken) {
    // The user modified the token
    return res.redirect('/expired');
  }

  const token: any = JSONCookie(unsignedToken);

  if (!token || new Date(token.expiredAt) > new Date()) {
    return res.redirect('/expired');
  }

  // ! Don't refresh this token, otherwise one could do this infinitely

  res.cookie('token', token, { signed: true }).redirect('/');
});
