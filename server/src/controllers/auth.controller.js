const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, designation, team } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      designation,
      team,
    });

    res.status(201).json({
      message: "Registration successful. Please wait for admin approval.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        team: user.team,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "pending") {
      return res
        .status(403)
        .json({ message: "Your account is pending admin approval" });
    }

    if (user.status === "rejected") {
      return res
        .status(403)
        .json({ message: "Your account has been rejected" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        designation: user.designation,
        team: user.team,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/auth/admin/login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    let admin = await User.findOne({ email, role: "admin" }).select(
      "+password",
    );

    // Auto-create admin on first login
    if (!admin) {
      admin = await User.create({
        firstName: "Admin",
        lastName: "User",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        designation: "System Administrator",
        team: "others",
        status: "approved",
        role: "admin",
      });
      admin = await User.findById(admin._id).select("+password");
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = generateToken(admin._id);

    res.json({
      token,
      user: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        designation: req.user.designation,
        team: req.user.team,
        role: req.user.role,
        status: req.user.status,
        avatarUrl: req.user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/auth/avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar file if exists
    if (user.avatarUrl) {
      const oldPath = path.join(
        __dirname,
        "../../uploads/avatars",
        path.basename(user.avatarUrl),
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        designation: user.designation,
        team: user.team,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/auth/avatar
exports.removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.avatarUrl) {
      const filePath = path.join(
        __dirname,
        "../../uploads/avatars",
        path.basename(user.avatarUrl),
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      user.avatarUrl = null;
      await user.save();
    }

    res.json({
      message: "Avatar removed",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        designation: user.designation,
        team: user.team,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
