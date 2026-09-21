const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Admin = require("../models/admin.model");
const sendEmail = require("../utils/sendEmail");

const generateToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({
        error: "Admin account already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin account created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = generateToken(admin._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

const getMe = async (req, res) => {
  res.status(200).json({
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
    },
  });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(200).json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    admin.resetToken = resetToken;
    admin.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await admin.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: admin.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to set a new password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    res.status(200).json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "New password is required" });
    }

    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        error: "Reset link is invalid or has expired",
      });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;

    await admin.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};