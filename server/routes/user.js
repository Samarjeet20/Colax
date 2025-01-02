const express = require("express");
const { handleUserSignup, handleUserLogin, handleUserEmailVerification, handleVerifiedUser, handlePasswordReset, handlegetUserProfile, handlegetUsers, handleUpdateUser } = require("../controller/Auth");

const router = express.Router();

//Get request for signup page
router.get('/signup', (req, res) => {
    res.render("signup");
})

//Post request for signup
router.post('/signup', handleUserSignup);

//Post request for login
router.post('/login', handleUserLogin);

//Get request to verify email
router.get('/verify/:userId/:uniqueString', handleUserEmailVerification);

//Get request for user profile
router.get('/profile',handlegetUserProfile);

//Get request for all users
router.get('/get-users',handlegetUsers);

//Get request to update user
router.get('/update-user-status/:id', handleUpdateUser);

//verified page route
router.get('/verified', handleVerifiedUser);

//password reset route
router.post('/resetPassword', handlePasswordReset);

//example home page
router.get('/home', (req, res) => {
    res.render("homePage");
})

module.exports = router;