const express = require("express");
const emotionalRecordsController = require("../controllers/emotionalRecordsController");
const { cognitoAuth } = require("../middlewares/cognitoAuth");

const router = express.Router();

router.get(
    "/emotionalrecords/:userId/list",
    cognitoAuth,
    emotionalRecordsController.listByUser
);

// CORRECCIÓN: Agregamos /create al final de la ruta
router.post(
    "/emotionalrecords/:userId/create",
    cognitoAuth,
    emotionalRecordsController.createForUser
);

module.exports = router;
