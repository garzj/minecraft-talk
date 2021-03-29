import { API } from '../API';
import { APIManager } from '../APIManager';
import { ClientConn } from './ClientConn';

export class ClientAPI extends API {
  constructor(mgr: APIManager) {
    super(mgr, 'client', ClientConn);
  }
}
