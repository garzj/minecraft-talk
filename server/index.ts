import './config/env';
console.log(`Starting app in ${process.env.NODE_ENV} mode...`);

import express from 'express';
const app = express();

import * as Http from 'http';
const server = Http.createServer(app);

import { APIManager } from './api/APIManager';
new APIManager(server);

import { Web } from './web/Web';
const web = new Web(server, app);

web.start();
