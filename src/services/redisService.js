const { createClient } = require("redis");

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.connect();

class RedisService {
  async set(key, value, expiry = 300) {
    await redisClient.set(key, JSON.stringify(value), { EX: expiry });
  }

  async get(key) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key) {
    await redisClient.del(key);
  }

  async incr(key) {
    return await redisClient.incr(key);
  }

  async getLoginAttempts(email) {
    const attempts = await redisClient.get(`login:attempts:${email}`);
    return attempts ? parseInt(attempts) : 0;
  }

  async setLoginAttempt(email, count) {
    await redisClient.set(`login:attempts:${email}`, count, { EX: 900 });
  }
}

module.exports = new RedisService();
