// controllers/authController.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const JWT_SECRET = process.env.JWT_SECRET;
const sendEmail = require("../utils/sendEmail");

exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      accountNumber,
      ifscCode,
      accountHolderName,
      contact, // phone/contact
      age,      // new field
      blockchainAddress, // new field
      // Demographic fields needed once at signup
      region,
      household_size,
      education_level,
      occupation,
      income_band
    } = req.body;

    // Default role (if not provided, assume 5 = User/Beneficiary)
    const userRole = role !== undefined ? role : 5;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !accountNumber ||
      !ifscCode ||
      !accountHolderName ||
      !contact ||
      age === undefined
    ) {
      return res.status(400).json({
        status: false,
        message: "All fields are required: name, email, password, accountNumber, ifscCode, accountHolderName, contact, age",
      });
    }

    // Check if user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User with this email already exists",
      });
    }

    // Check if accountNumber is unique
    const existingAccount = await User.findOne({ accountNumber });
    if (existingAccount) {
      return res.status(400).json({
        status: false,
        message: "Account number already in use",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      accountNumber,
      ifscCode,
      accountHolderName,
      contact,
      age,
      blockchainAddress,
      region,
      household_size,
      education_level,
      occupation,
      income_band
    });

    await newUser.save();

    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        accountNumber: newUser.accountNumber,
        ifscCode: newUser.ifscCode,
        accountHolderName: newUser.accountHolderName,
        contact: newUser.contact,
        age: newUser.age,
        blockchainAddress: newUser.blockchainAddress
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to register user. Please try again later.",
    });
  }
};

// @desc Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Find user
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        success: false,
        message: "Invalid password",
      });
    }

    // 🔹 Generate OTP
    // const otp = crypto.randomInt(100000, 999999).toString(); // ← normal mode
    const otp = "111111"; // ← test mode (fixed OTP)
 
    // 🔹 Save OTP + expiry (5 min)
    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    // 🔹 Send OTP via Email
    await sendEmail(user.email, "Your Login OTP", `Your OTP is: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// @desc Get current logged-in user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 🔹 Find user
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 Check OTP validity
    if (user.resetOTP !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // 🔹 Clear OTP after verification
    user.resetOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // 🔹 Create JWT payload
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 🔹 Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const isProduction = process.env.NODE_ENV === "production";

    // 🔹 Send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 🔹 Remove sensitive fields
    const { password, resetPasswordToken, resetPasswordExpires, resetOTP, otpExpiry, ...safeUser } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};
// @desc Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔹 Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 🔹 Save OTP + expiry (5 min)
    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    // 🔹 Send OTP via Email
    await sendEmail(user.email, "Your Login OTP", `Your OTP is: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};


// controllers/authController.js

// @desc Logout user
exports.logoutUser = async (req, res) => {
  try {
    // Clear the cookie that stores JWT
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
