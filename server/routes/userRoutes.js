const express = require('express');
const userAuth = require('../middlewar/userAuth.js');
const { getUserData } = require('../controllers/userController.js');
const authMiddleware = require('../middlewar/authmiddlewar.js');

const router = express.Router();

router.get("/data",userAuth,getUserData)

module.exports = router;