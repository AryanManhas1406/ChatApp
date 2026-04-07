const jwt  = require("jsonwebtoken");
const User = require("../models/user.js");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: " No token provided. Please login first."
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: " User not found"
      });
    }
    req.user = user;

    next();

  } catch (err) {
    res.status(401).json({
      message: " Invalid or expired token. Please login again."
    });
  }
};

module.exports = authMiddleware;