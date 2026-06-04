const redisService = require("../services/redisService");

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate:limit:${ip}`;

    let requests = await redisService.incr(key);

    if (requests === 1) {
      await redisService.expire(
        key,
        parseInt(process.env.RATE_LIMIT_WINDOW) || 60,
      );
    }

    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 20;

    if (requests > maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate Limiter Error:", error);
    next(); // Continue even if rate limiter fails (fail-safe)
  }
};

module.exports = rateLimiter;
