import { Web } from '../Web';
import { loginRouter } from './login';
import { logoutRouter } from './logout';
import { webAppRouter } from './webapp';

export function routes(web: Web) {
  web.app.use(loginRouter);
  web.app.use(logoutRouter(web));
  web.app.use(webAppRouter);
}
