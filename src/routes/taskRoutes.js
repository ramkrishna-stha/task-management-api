const express = require("express");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const auth = require("../middleware/auth");
const { taskValidation, taskIdValidation } = require("../middleware/validator");

const router = express.Router();

router.post("/", auth, taskValidation, createTask);
router.get("/", auth, getTasks);
router.put("/:id", auth, taskIdValidation, taskValidation, updateTask);
router.delete("/:id", auth, taskIdValidation, deleteTask);

module.exports = router;
