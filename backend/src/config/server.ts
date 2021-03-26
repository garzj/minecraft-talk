import * as Http from 'http';

const server = Http.createServer();

const port = process.env.PORT;
server.listen(port, () => console.log(`Listening on port ${port}.`));

export default server;
