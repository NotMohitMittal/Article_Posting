const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");

const registerUser = async (req, res) => {
  const { user_name, user_email, user_password } = req.body;

  try {
    const existingUser = await userModel.findOne({ user_email });

    if (existingUser) {
      return res.status(401).json({
        message: "Email already in use",
      });
    }

    const user = await userModel.create({
      user_name,
      user_email,
      user_password,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const loginUser = async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    const user = await userModel
      .findOne({ user_email })
      .select("+user_password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(user_password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.ENVIRONMENT === "production",
      maxAge: 7 * 24 * 24 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged-in",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User profile fetched",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.ENVIRONMENT === "production",
    });

    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Logout failed",
    });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, logoutUser };
