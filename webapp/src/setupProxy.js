const pkg = require('../package.json');
const proxy = require('http-proxy-middleware');

module.exports = (app) => {
  if (pkg.proxy) {
    app.use(proxy('/socket', { target: pkg.proxy, ws: true }));
    app.use(proxy('/logout', { target: pkg.proxy }));
  }
};
