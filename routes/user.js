const express = require('express');
const router = express.Router();

// Importing controller functions
const { login, signUp, sendOtp } = require('../controller/Auth');




// Routes for Login, Signup, and Authentication

// Public routes
router.post('/login', login);
router.post('/signup', signUp);
router.post('/sendotp', sendOtp);

module.exports = router;
