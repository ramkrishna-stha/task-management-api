const express = require("express");
const {
  register,
  login,
  logout,
  getSession,
} = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/session-info", auth, getSession);

module.exports = router;
