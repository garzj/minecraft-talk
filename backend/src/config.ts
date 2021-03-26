import * as dotenv from 'dotenv';
dotenv.config();

// NODE_ENV
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Config options
type ConfigOption = 'port' | 'conversationSecret';

// Default config
const config: Record<ConfigOption, string> = {
  port: '3030',
  conversationSecret: 'LhKB7U1svggGYx7ZGaLb',
};

// Allow configuration over env variables e. g. CONVERSATION_SECRET=somesecret
for (let key of Object.keys(config)) {
  const capitalizedKey = key.replace(/(?<!^)([A-Z])/g, '_$1').toUpperCase();

  if (Object.prototype.hasOwnProperty.call(process.env, capitalizedKey)) {
    config[key as ConfigOption] = process.env[capitalizedKey];
  }
}

export default config;
