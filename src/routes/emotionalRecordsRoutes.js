const express = require("express");
const emotionalRecordsController = require("../controllers/emotionalRecordsController");
const { cognitoAuth } = require("../middlewares/cognitoAuth");

const router = express.Router();

router.get(
	"/emotionalrecords/:userId/list",
	cognitoAuth,
	emotionalRecordsController.listByUser
);

module.exports = router;
