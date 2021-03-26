import config from './config';
import * as Http from 'http';

console.log(`Starting app in ${process.env.NODE_ENV} mode...`);

const server = Http.createServer();

export default server;

import './socket';

const port = config.port;
server.listen(port, () => console.log(`Listening on port ${port}.`));
