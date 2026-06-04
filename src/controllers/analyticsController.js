const redisService = require("../services/redisService");

exports.getAnalytics = async (req, res) => {
  try {
    const analytics = {
      totalLogins:
        parseInt(await redisService.get("analytics:totalLogins")) || 0,
      tasksCreated:
        parseInt(await redisService.get("analytics:tasksCreated")) || 0,
      tasksUpdated:
        parseInt(await redisService.get("analytics:tasksUpdated")) || 0,
      tasksDeleted:
        parseInt(await redisService.get("analytics:tasksDeleted")) || 0,
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
};
