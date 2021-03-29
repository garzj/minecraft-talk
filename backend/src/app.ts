import './config/env';
console.log(`Starting app in ${process.env.NODE_ENV} mode...`);

import * as express from 'express';
const app = express();

import * as Http from 'http';
const server = Http.createServer(app);

import { APIManager } from './api/APIManager';
const apiMgr = new APIManager(server);

import { Web } from './web/Web';
const web = new Web(app, apiMgr);

web.start();
