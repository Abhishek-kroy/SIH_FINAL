// routes/auth.js
const express = require("express");
const { registerUser, loginUser, getMe, logoutUser, verifyOtp, resendOtp } = require("../controller/authController");
const {auth, isAdmin, isUser} = require("../middlewares/authMiddleware");

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp); // Step 2: verify OTP & login
router.get("/me", auth, getMe);
router.post("/logout", auth, logoutUser);
router.post("/resend-otp", resendOtp);

module.exports = router;
