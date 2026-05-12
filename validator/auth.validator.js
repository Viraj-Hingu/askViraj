import { body, validationResult } from "express-validator";

export const validator = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({
      message: error.array()[0]?.msg || "Validation failed",
      errors: error.array(),
      success: false,
    });
  }
  next();
};

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be 3-20 characters")
    .matches(/^[A-Za-z0-9 _.-]+$/)
    .withMessage("Username can include letters, numbers, spaces, ., _, -"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  validator,
];

export const loginValiator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter valid email"),
  body("password").notEmpty().withMessage("Enter password"),
  validator,
];
