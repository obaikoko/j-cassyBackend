const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');

// @desc Register User
// @privacy public
// @route POST /api/users
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all filed');
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error('User already Exist');
  }

  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password);
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!hasValidEmail) {
    res.status(400);
    throw new Error('Add a valid email address');
  }

  if (
    password.length < minLength ||
    !hasUppercase ||
    !hasLowercase ||
    !hasDigit ||
    !hasSpecialChar
  ) {
    res.status(400);
    throw new Error(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201);
    res.json({
      name: user.name,
      email: user.email,
      _id: user.id,
      token: generateToken(user._id),
    });
  } else {
    res.status(200);
    throw new Error('Something went wrong');
  }
});

// @desc Login User
// @privacy public
// @route POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!email || !password) {
    res.status(400);
    throw new Error('Invalid email or password ');
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200);
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
  }
});

// @desc Get  Userdate
// @privacy public
// @route POST /api/users
const getMe = asyncHandler(async (req, res) => {
  const { name, email, _id } = await User.findByIdAndUpdate(req.user.id);
  res.status(200);
  res.json({
    id: _id,
    name,
    email,
  });
});

// @desc POST  updateProfile
// @privacy private
// @route POST /api/users/profile

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  // userExist
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error('User already Exist');
  }

  
  const userData = await User.findByIdAndUpdate(
    req.user,
    { name, email },
    { new: true }
  );
  res.status(200);
  res.json(userData);
});

// @desc POST update Password
// @privacy public
// @route POST /api/users/resetPassword

const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error(`No account found for ${email} `);
  } else {
    const sixDigitNumber = generateSixDigitNumber();
    const expirationTime = new Date(Date.now() + 60000); // 60 seconds in milliseconds

    // Store the number and its expiration time in the user document
    user.resetNumber = sixDigitNumber;
    user.resetNumberExpires = expirationTime;
    await user.save();

    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'jessecandy396@gmail.com',
          pass: process.env.GMAILPASSWORD,
        },
        tls: {
          rejectUnauthorized: true,
        },
      });

      const mailOptions = {
        from: 'J-CANDY',
        to: email,
        subject: 'PASSWORD RESET',
        text: `Here is your OTP which expires on ${expirationTime}: ${sixDigitNumber}`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: `Email sent successfully! to ${email}` });
    } catch (error) {
      console.error(error);
      res.status(500);
      throw new Error('Email could not be sent.');
    }
  }

  function generateSixDigitNumber() {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
});

const verifyResetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(newPassword);

  if (!user) {
    res.status(404);
    throw new Error(`No account found for ${email}`);
  }

  if (user.resetNumber !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  if (user.resetNumberExpires < new Date()) {
    res.status(400);
    throw new Error('OTP has expired');
  }

  if (
    password.length < minLength ||
    !hasUppercase ||
    !hasLowercase ||
    !hasDigit ||
    !hasSpecialChar
  ) {
    res.status(400);
    throw new Error(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;

  user.resetNumber = '';
  user.resetNumberExpires = '';

  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  resetPassword,
  verifyResetPassword,
  updateProfile,
};
