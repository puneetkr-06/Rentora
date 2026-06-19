import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});


export const clearCache = async (key: string) => {
  try {
    await redis.del(key);
    console.log(`Cache cleared successfully for key: ${key}`);
  } catch (error) {
    console.error(`Redis Delete Error for key ${key}:`, error);
  }
};