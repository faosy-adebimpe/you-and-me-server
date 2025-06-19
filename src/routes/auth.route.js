const { StatusCodes } = require('http-status-codes');
const express = require('express');

// create router
const router = express.Router();

// import controller
const {
    register,
    login,
    logout,
    checkAuth,
    uploadProfilePicture,
    forgotPassword,
    createVerificationEmail,
    verifyEmail,
    verifyOTP,
    resetPassword,
} = require('../controllers/auth.controller');

// import middlewares
const authenticated = require('../middlewares/authenticated.middleware');

// create routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(authenticated, logout);
router.route('/check-auth').get(authenticated, checkAuth);
router
    .route('/upload-profile-picture')
    .post(authenticated, uploadProfilePicture);
router
    .route('/request-verification-email')
    .post(authenticated, createVerificationEmail);
router.route('/verify-email').post(verifyEmail);
router.route('/forgot-password').post(forgotPassword);
// router.route('/forgot-password/verify-otp').post(verifyOTP);
router.route('/verify-otp').post(verifyOTP);
// router.route('/forgot-password/change-password').post(changePassword);
// router.route('/change-password').post(changePassword);
router.route('/reset-password').post(resetPassword);

// export router
module.exports = router;
