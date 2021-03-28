const pkg = require('../package.json');
const proxy = require('http-proxy-middleware');

module.exports = (app) => {
  if (pkg.proxy) {
    app.use(proxy('/api/*', { target: pkg.proxy, ws: true }));
    app.use(proxy('/login', { target: pkg.proxy }));
    app.use(proxy('/logout', { target: pkg.proxy }));
  }
};
