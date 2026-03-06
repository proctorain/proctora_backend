import { createClient } from 'redis';
import { REDIS_URL } from './env.js';

export const redisClient = createClient({
    url: REDIS_URL
});

redisClient.on("error", (err)=>{
    console.log("Redis error: ", err)
});

redisClient.connect().then(()=>{
    console.log("Redis is connected.")
})