const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const validateUserInput = (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({
      errors: error.array(),
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(404).json({
      message: "Token not found",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = { validateUserInput, validateLogin };
