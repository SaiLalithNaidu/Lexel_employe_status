const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

router.use(auth, adminAuth);

router.get("/pending-users", adminController.getPendingUsers);
router.put("/users/:id/approve", adminController.approveUser);
router.put("/users/:id/reject", adminController.rejectUser);
router.get("/users", adminController.getAllUsers);

module.exports = router;
