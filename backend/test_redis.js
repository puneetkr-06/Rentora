const { Redis } = require('@upstash/redis');
require('dotenv').config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function run() {
  const owner_id = 'fae66040-b24a-4739-bd17-e6de04fa3ec7';
  const val = await redis.get(`owner_metrics_v4_${owner_id}`);
  console.log("Cached v4:", val);
}
run();
