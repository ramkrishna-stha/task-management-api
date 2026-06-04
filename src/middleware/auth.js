const redisService = require("../services/redisService");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const token = authHeader.replace("Bearer ", "");
    const session = await redisService.get(`session:${token}`);

    if (!session) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Session expired or invalid. Please login again.",
        });
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await redisService.del(`session:${token}`);
      return res
        .status(401)
        .json({
          success: false,
          message: "Session expired. Please login again.",
        });
    }

    req.user = { id: session.userId };
    req.token = token;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

module.exports = auth;
