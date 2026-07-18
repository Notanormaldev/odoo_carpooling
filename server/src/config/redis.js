import Redis from 'ioredis';

let redisClient = null;
let redisPub = null;
let redisSub = null;

const createRedisClient = (name = 'default') => {
  const client = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) {
        console.error(`❌ Redis ${name}: Max retries reached. Giving up.`);
        return null;
      }
      const delay = Math.min(times * 200, 5000);
      console.warn(`⚠️ Redis ${name}: Retry #${times} in ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err) => {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
      return targetErrors.some((e) => err.message.includes(e));
    },
  });

  client.on('connect', () => console.log(`✅ Redis ${name} connected`));
  client.on('error', (err) => console.error(`❌ Redis ${name} error:`, err.message));
  client.on('close', () => console.warn(`⚠️ Redis ${name} connection closed`));

  return client;
};

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient('client');
  }
  return redisClient;
};

export const getRedisPub = () => {
  if (!redisPub) {
    redisPub = createRedisClient('publisher');
  }
  return redisPub;
};

export const getRedisSub = () => {
  if (!redisSub) {
    redisSub = createRedisClient('subscriber');
  }
  return redisSub;
};

export const closeRedis = async () => {
  const clients = [redisClient, redisPub, redisSub].filter(Boolean);
  await Promise.all(clients.map((c) => c.quit()));
  redisClient = null;
  redisPub = null;
  redisSub = null;
};

export default { getRedisClient, getRedisPub, getRedisSub, closeRedis };
