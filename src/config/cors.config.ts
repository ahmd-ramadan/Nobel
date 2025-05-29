import { CorsOptions } from 'cors';
import { SERVER } from '../utils';
import { nodeEnv } from './server.env';
import { clientUrl } from './client.env';

export const corsConfig: CorsOptions = {
  origin: "*", //nodeEnv === SERVER?.DEVELOPMENT ? SERVER?.LOCALHOST_URLS : clientUrl,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};