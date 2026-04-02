const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team.controller");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/teams/:teamName", teamController.getTeamMembers);
router.get("/employees/:id", teamController.getEmployee);
router.get("/employees/:id/tasks", teamController.getEmployeeTasks);

module.exports = router;
