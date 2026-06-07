const express = require("express");
const chartsController = require("../controllers/chartsController");
const { cognitoAuth } = require("../middlewares/cognitoAuth");

const router = express.Router();

router.get("/charts/:userId/emotional-distribution", cognitoAuth, chartsController.getEmotionalDistribution);
router.get("/charts/:userId/weekly-tasks", cognitoAuth, chartsController.getWeeklyTaskProgress);
router.get("/charts/:userId/cognitive-trend", cognitoAuth, chartsController.getCognitiveTrend);

module.exports = router;
