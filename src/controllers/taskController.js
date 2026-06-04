const Task = require("../models/Task");
const redisService = require("../services/redisService");
const logger = require("../utils/logger");

const CACHE_PREFIX = "tasks:user:";

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user.id,
    });

    // Invalidate cache
    await redisService.del(`${CACHE_PREFIX}${req.user.id}`);

    // Analytics
    await redisService.incr("analytics:tasksCreated");

    logger.info(`Task created: ${task._id} by user ${req.user.id}`);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${req.user.id}`;
    let tasks = await redisService.get(cacheKey);

    if (!tasks) {
      tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
      await redisService.set(cacheKey, tasks, 300); // 5 minutes cache
    }

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Invalidate cache
    await redisService.del(`${CACHE_PREFIX}${req.user.id}`);

    await redisService.incr("analytics:tasksUpdated");
    logger.info(`Task updated: ${task._id}`);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Invalidate cache
    await redisService.del(`${CACHE_PREFIX}${req.user.id}`);

    await redisService.incr("analytics:tasksDeleted");
    logger.info(`Task deleted: ${task._id}`);

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
