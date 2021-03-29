import { Router } from 'express';
import { ClientAPI } from '../../api/client-api/ClientAPI';
import { Web } from '../Web';

export function logoutRouter(web: Web) {
  const logoutRouter = Router();

  logoutRouter.get('/logout', (req, res, next) => {
    const token = req.signedCookies.token;
    if (token && typeof token.uuid === 'string') {
      (web.apiMgr.apis.client as ClientAPI).logoutUser(token.uuid);
    }

    res.clearCookie('token');

    next();
  });

  return logoutRouter;
}
