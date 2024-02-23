const pkg = require('./package.json');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  if (pkg.proxy) {
    app.use(createProxyMiddleware('/api/*', { target: pkg.proxy, ws: true }));
    app.use(createProxyMiddleware('/login', { target: pkg.proxy }));
  }
};
