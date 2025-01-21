const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, logOutUser } = require('../controllers/authController'); 
const authMiddlewar = require('../middlewar/authmiddlewar')


router.post('/register', registerUser);
router.post('/login', loginUser);      
router.get('/profile',authMiddlewar, getUserProfile);
router.post('/logout', logOutUser);

module.exports = router;