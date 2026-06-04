const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const redisService = require("../services/redisService");
const logger = require("../utils/logger");

const id = uuidv4();

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check failed login attempts
    const attempts = await redisService.getLoginAttempts(email);
    if (attempts >= 5) {
      return res.status(429).json({
        success: false,
        message:
          "Too many failed login attempts. Account is locked for 15 minutes.",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Increment failed attempts
      const newAttempts = attempts + 1;
      await redisService.setLoginAttempt(email, newAttempts);

      logger.warn(`Failed login attempt #${newAttempts} for ${email}`);

      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Create session
    const sessionToken = uuidv4();
    const sessionData = {
      userId: user._id,
      loginTime: new Date().toISOString(),
      expiresAt: Date.now() + parseInt(process.env.SESSION_EXPIRY) * 1000,
    };

    await redisService.set(
      `session:${sessionToken}`,
      sessionData,
      parseInt(process.env.SESSION_EXPIRY),
    );

    // Increment analytics
    await redisService.incr("analytics:totalLogins");

    logger.info(`User logged in successfully: ${email}`);

    res.json({
      success: true,
      message: "Login successful",
      token: sessionToken,
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.token;
    if (token) {
      await redisService.del(`session:${token}`);
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

exports.getSession = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};
