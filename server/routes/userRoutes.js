const express = require('express');
const userAuth = require('../middleware/userAuth.js');
const { getUserData } = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get("/data",authMiddleware,getUserData)

module.exports = router;