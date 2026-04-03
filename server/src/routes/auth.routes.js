const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("designation")
      .trim()
      .notEmpty()
      .withMessage("Designation is required"),
    body("team")
      .isIn(["development", "testing", "others"])
      .withMessage("Invalid team"),
  ],
  (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.login,
);

router.post(
  "/admin/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.adminLogin,
);

router.get("/me", auth, authController.getMe);

// Avatar upload/remove
router.post(
  "/avatar",
  auth,
  upload.single("avatar"),
  authController.uploadAvatar,
);
router.delete("/avatar", auth, authController.removeAvatar);

module.exports = router;
