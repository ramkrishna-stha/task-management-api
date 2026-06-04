const { body, param, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Auth Validation
exports.registerValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

exports.loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  validate,
];

// Task Validation
exports.taskValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("priority").optional().isIn(["Low", "Medium", "High"]),
  validate,
];

exports.taskIdValidation = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  validate,
];
