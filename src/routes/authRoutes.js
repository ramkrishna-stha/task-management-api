const express = require("express");
const {
  register,
  login,
  logout,
  getSession,
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validator");

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", auth, logout);
router.get("/session-info", auth, getSession);

module.exports = router;
