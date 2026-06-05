/* const express = require("express");
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
 */
const express = require("express");
const emotionalRecordsController = require("../controllers/emotionalRecordsController");
// Comenta temporalmente esta línea para que no pida las variables de AWS
// const { cognitoAuth } = require("../middlewares/cognitoAuth");

const router = express.Router();

// Simulador temporal para Postman
const mockAuth = (req, res, next) => {
    req.auth = { sub: "84e894a8-e001-7033-d7f1-d871dcc6d608" };
    next();
};

router.get(
    "/emotionalrecords/:userId/list",
    mockAuth, // Usamos el simulador aquí
    emotionalRecordsController.listByUser
);

router.post(
    "/emotionalrecords/:userId/create",
    mockAuth, // Usamos el simulador aquí
    emotionalRecordsController.createForUser
);

module.exports = router;