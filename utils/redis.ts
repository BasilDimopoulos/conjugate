import { RedisClientType, createClient } from 'redis';

class RedisService {
  public client: RedisClientType;

  constructor() {
    console.log('Redis Constructing...');
    this.client = createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT), // Ensure it's a number
      },
    });

    this.client.on('error', (err: Error) =>
      console.error('Redis Client Error:', err)
    );

    this.client.connect();
  }

  // /**
  //  * Sets a key-value pair in Redis
  //  * @param key - The key to store
  //  * @param value - The value to store (string or JSON object)
  //  * @param ttl - (Optional) Expiry time in seconds
  //  */
  // async set(key: string, value: string | object, ttl?: number): Promise<void> {
  //   try {
  //     const valueToStore =
  //       typeof value === 'object' ? JSON.stringify(value) : value;

  //     if (ttl) {
  //       await this.redisClient.set(key, valueToStore, { EX: ttl });
  //     } else {
  //       await this.redisClient.set(key, valueToStore);
  //     }
  //   } catch (error) {
  //     console.error(`Redis SET error for key "${key}":`, error);
  //   }
  // }

  // /**
  //  * Retrieves a value from Redis
  //  * @param key - The key to retrieve
  //  * @returns The stored value (parsed JSON if applicable)
  //  */
  // async get<T = string>(key: string): Promise<T | null> {
  //   try {
  //     const value = await this.redisClient.get(key);
  //     if (!value) return null;

  //     try {
  //       return JSON.parse(value) as T; // Try to parse JSON
  //     } catch {
  //       return value as T; // Return as string if parsing fails
  //     }
  //   } catch (error) {
  //     console.error(`Redis GET error for key "${key}":`, error);
  //     return null;
  //   }
  // }

  // /**
  //  * Deletes a key from Redis
  //  * @param key - The key to delete
  //  */
  // async delete(key: string): Promise<void> {
  //   try {
  //     await this.redisClient.del(key);
  //   } catch (error) {
  //     console.error(`Redis DELETE error for key "${key}":`, error);
  //   }
  // }

  // /**
  //  * Checks if a key exists in Redis
  //  * @param key - The key to check
  //  * @returns True if the key exists, otherwise false
  //  */
  // async exists(key: string): Promise<boolean> {
  //   try {
  //     const result = await this.redisClient.exists(key);
  //     return result > 0;
  //   } catch (error) {
  //     console.error(`Redis EXISTS error for key "${key}":`, error);
  //     return false;
  //   }
  // }

  // /**
  //  * Checks the cardinality (size) of a Redis set
  //  * @param key - The key of the Redis set
  //  * @returns The number of elements in the set, or 0 if the set doesn't exist
  //  */
  // async scard(key: string): Promise<number> {
  //   try {
  //     const cardinality = await this.redisClient.sCard(key);
  //     return cardinality;
  //   } catch (error) {
  //     console.error(`Redis SCARD error for key "${key}":`, error);
  //     return 0;
  //   }
  // }

  // async sadd(key: string, members: any): Promise<number> {
  //   try {
  //     // Check if the members is an array or a single member and handle it accordingly
  //     if (Array.isArray(members)) {
  //       const addedCount = await this.redisClient.sAdd(key, ...members);
  //       return addedCount;
  //     } else {
  //       const addedCount = await this.redisClient.sAdd(key, members);
  //       return addedCount;
  //     }
  //   } catch (error) {
  //     console.error(`Redis SADD error for key "${key}":`, error);
  //     return 0;
  //   }
  // }

  // /**
  //  * Disconnects from Redis
  //  */
  // async disconnect(): Promise<void> {
  //   try {
  //     await this.redisClient.quit();
  //     console.log('Redis Disconnected');
  //   } catch (error) {
  //     console.error('Redis Disconnection Error:', error);
  //   }
  // }
}

export const redis = new RedisService();
