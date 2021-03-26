import { Socket } from 'socket.io';
import onLogin from './login';
import onLogout from './logout';
import onUpdateVols from './update-vols';

class ServerAPI {
  constructor(socket: Socket) {
    socket.on('login', onLogin);
    socket.on('logout', onLogout);
    socket.on('update-vols', onUpdateVols);
  }
}

export default ServerAPI;
