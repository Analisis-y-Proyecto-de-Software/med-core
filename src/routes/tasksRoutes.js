const express = require("express");
const tasksController = require("../controllers/tasksController");
const { cognitoAuth } = require("../middlewares/cognitoAuth");

const router = express.Router();

router.get("/tasks/:userId/list", cognitoAuth, tasksController.listByUser);

module.exports = router;
