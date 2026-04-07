const express    = require("express");
const router     = express.Router();
const authMiddleware = require("../Middlewares/authMiddleware.js");
const {
  register,
  login
} = require("../controller/authController.js");

router.post("/register", register);
router.post("/login",    login);

// router.get("/me", authMiddleware, async (req, res) => {
//   res.json({
//     user: {
//       id:       req.user._id,
//       username: req.user.username,
//       email:    req.user.email,
//       isOnline: req.user.isOnline
//     }
//   });
// });

module.exports = router;