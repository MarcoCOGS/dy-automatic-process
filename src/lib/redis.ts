import Redis from 'ioredis';

import { ServerConfig } from './server-config';

const redis = new Redis(ServerConfig.redisPath);

export default redis;
