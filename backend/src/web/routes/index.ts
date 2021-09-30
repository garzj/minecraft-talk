import { Web } from '../Web';
import { loginRouter } from './login';
import { webAppRouter } from './webapp';

export function applyRoutes(web: Web) {
  web.app.use(loginRouter);
  web.app.use(webAppRouter);
}
