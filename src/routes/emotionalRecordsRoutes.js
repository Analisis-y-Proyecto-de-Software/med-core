const express = require("express");
const emotionalRecordsController = require("../controllers/emotionalRecordsController");
const { cognitoAuth } = require("../middlewares/cognitoAuth");

const router = express.Router();

const validMonths = new Set([
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "setiembre", "octubre",
  "noviembre", "diciembre",
]);

const ensureValidMonth = (req, _res, next) => {
  const month = String(req.params.month || "").trim().toLowerCase();
  if (!validMonths.has(month)) return next("route");
  return next();
};

router.get(
  "/emotionalrecords/:userId/list",
  cognitoAuth,
  emotionalRecordsController.listByUser
);

router.post(
  "/emotionalrecords/:userId/create",
  cognitoAuth,
  emotionalRecordsController.createForUser
);

router.get(
  "/:month/:userId",
  ensureValidMonth,
  cognitoAuth,
  emotionalRecordsController.getMonthlySummaryByUser
);

module.exports = router;
