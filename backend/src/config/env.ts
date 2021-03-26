import * as dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV ??= 'production';
process.env.PORT ??= '3030';
process.env.CONVERSATION_SECRET ??= 'LhKB7U1svggGYx7ZGaLb';
