const express = require("express");
const { body } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.post(
  "/register",
  [
    body("user_name").trim().notEmpty().withMessage("User-name is required"),

    body("user_email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("user_password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],

  authMiddleware.validateUserInput,
  userController.registerUser,
);

router.post(
  "/login",
  [
    body("user_email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("user_password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  authMiddleware.validateUserInput,
  userController.loginUser,
);

router.get(
  "/profile",
  authMiddleware.validateLogin,
  userController.getUserProfile,
);

router.post("/logout", userController.logoutUser);

module.exports = router;
