import { Router } from 'express';
import { ClientAPI } from '../../api/client-api/ClientAPI';
import { validateToken } from '../../bin/validate-token';
import { Web } from '../Web';

export function logoutRouter(web: Web) {
  const logoutRouter = Router();

  logoutRouter.get('/logout', (req, res, next) => {
    const token = req.signedCookies.token;
    if (validateToken(token)) {
      (web.apiMgr.apis.client as ClientAPI).logoutUser(token.uuid);
    }

    res.clearCookie('token');

    next();
  });

  return logoutRouter;
}
