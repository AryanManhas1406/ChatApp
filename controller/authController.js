const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");
const User   = require("../models/user.js");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET; 

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists"
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });
    const token = jwt.sign(
      {
        id:       newUser._id,
        username: newUser.username
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: " User registered successfully",
      token,
      user: {
        id:       newUser._id,
        username: newUser.username,
        email:    newUser.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: " User not found"
      });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: " Wrong password"
      });
    }

    const token = jwt.sign(
      {
        id:       user._id,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: " Login successful",
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};