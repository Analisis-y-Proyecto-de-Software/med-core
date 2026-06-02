const express = require("express");
const tasksController = require("../controllers/tasksController");
const { cognitoAuth } = require("../middlewares/cognitoAuth");

const router = express.Router();

router.get("/summary/:userId", cognitoAuth, tasksController.getDailySummary);
router.get("/tasks/:userId/list", cognitoAuth, tasksController.listByUser);
router.post("/tasks/:userId/create", cognitoAuth, tasksController.create);
router.patch("/tasks/:taskId/status", cognitoAuth, tasksController.updateStatus);
router.delete("/tasks/:taskId", cognitoAuth, tasksController.remove);

module.exports = router;
