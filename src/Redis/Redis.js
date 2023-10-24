import { Redis } from "ioredis";
import { RedisClient } from "../Config/env.config.js";




class RedisClass {
    redis;
    RedisClient = RedisClient;
    constructor() {
        const { host, port, password } = this.RedisClient;
        const URL = `redis://:${password}@${host}:${port}`;

        this.redis = new Redis(URL);
        // this.connect();
    }

    connect() {
        this.redis.on('connect', () => {
            console.log('Connected to Redis');
        });

        this.redis.on('error', (error) => {
            console.error('Error connecting to Redis:', error);
        });
    }

    async ADDRESS_REDIS(key, value) {
        return await this.redis.set(key, value);
    }

    async DISCOUNT_REDIS(key, value, number) {
        return await this.redis.set(key, value, 'EX', number);
    }

    async SET_REDIS(key, value) {
        return await this.redis.set(key, value, 'EX', 3600);
    }
    async REFRESH_TOKEN(key, value) {
        return await this.redis.set(key, value, 'EX', 31536000);
    }

    async GET_REDIS(key) {
        return await this.redis.get(key);
    }

    async DEL_REDIS(key) {
        return await this.redis.del(key);
    }
}

export {
    RedisClass
}
