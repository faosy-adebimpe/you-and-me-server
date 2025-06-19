const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const { sendVerificationEmail } = require('../lib/mail'); // import sendVerificationEmail function
const { sendOTPEmail } = require('../lib/mail'); // import sendOTPEmail function
const { uploadImage } = require('../lib/cloudinary'); // import uploadImage function

const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        throw new BadRequestError('All fields are required');
    }

    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new BadRequestError('Email already in use');
        // User already exists
    }
    // create user
    const user = new User({ username, email, password });
    await user.save(); // save user to database

    // send verification email
    const verificationToken = await sendVerificationEmail(email, user._id);

    // save verification token to user database
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save(); // save user to database

    const userObject = user.toObject(); // convert user to object
    delete userObject.password; // remove password from user object
    delete userObject.verificationToken;
    delete userObject.verificationTokenExpires;
    delete userObject.__v;

    // create cookie
    user.createCookie(res);

    // send response
    return res.status(StatusCodes.CREATED).json(userObject);
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError('All fields are required');
    }

    // Make sure this line exists:
    const user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (!user) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    // check passwords
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const userObject = user.toObject(); // convert user to object
    delete userObject.password; // remove password from user object
    delete userObject.__v;

    // create cookie
    user.createCookie(res);

    // send response
    return res.status(StatusCodes.OK).json(userObject);
};

const logout = async (req, res) => {
    res.clearCookie('auth-token'); // clear cookie
    return res
        .status(StatusCodes.OK)
        .json({ message: 'Logged out successfully' });
};

const checkAuth = async (req, res) => {
    const { _id } = req.user; // get user id from request
    const user = await User.findOne({ _id });
    res.status(StatusCodes.OK).json(user);
};

const uploadProfilePicture = async (req, res) => {
    const { _id } = req.user;
    const { profilePicture } = req.body;
    const user = await User.findOne({ _id });
    if (!user) {
        throw new BadRequestError('User is not registered');
    }

    // check if file is provided
    if (!profilePicture) {
        throw new BadRequestError('Profile picture is required');
    }

    // update user profile picture
    const imageUrl = await uploadImage(profilePicture); // upload image to cloudinary
    user.image = imageUrl; // set profile picture url

    // save to the database;
    await user.save();
    return res.status(StatusCodes.OK).json({
        message: 'Profile picture updated successfully',
        user,
    });
};

const createVerificationEmail = async (req, res) => {
    const { _id } = req.user;
    const user = await User.findById({ _id });
    if (!user) {
        throw new BadRequestError('User is not registered');
    }

    // send verification email
    const verificationToken = await sendVerificationEmail(user.email, user._id);

    // save verification token to user database
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save(); // save user to database

    res.status(StatusCodes.OK).json({ message: 'Verfication email sent' });
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        throw new BadRequestError('Verification token not provided');
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        throw new BadRequestError('Invalid verification token');
    }

    // find user by id
    const user = await User.findById(decoded.id);
    if (!user) {
        throw new BadRequestError('User not found');
    }

    // check if token is expired
    if (user.verificationTokenExpires < Date.now()) {
        throw new BadRequestError('Verification token expired');
    }

    // update user verified status
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save(); // save user to database

    return res
        .status(StatusCodes.OK)
        .json({ message: 'Email verified successfully' });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new BadRequestError('Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new BadRequestError('Email is not registered');
    }

    // generate a password reset token
    const otp = await sendOTPEmail(email); // send OTP email
    user.forgotPasswordToken = otp;
    user.forgotPasswordTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    // await user.save({ validateBeforeSave: false }); // save user without validation

    // send password reset email
    // await sendVerificationEmail(email, resetToken);

    return res.status(StatusCodes.OK).json({
        // message: 'Password reset email sent successfully',
        message: 'OTP sent successfully',
    });
};

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    // verify the otp
    if (!email || !otp) {
        throw new BadRequestError('Email and OTP are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new BadRequestError('Email is not registered');
    }

    // check if otp is expired
    if (user.forgotPasswordTokenExpires < Date.now()) {
        throw new BadRequestError('OTP is expired');
    }

    // check if otp match
    if (otp !== user.forgotPasswordToken) {
        throw new BadRequestError('Incorrect OTP');
    }

    // user.forgotPasswordToken = undefined;
    // user.verificationTokenExpires = undefined;
    // await user.save();

    return res
        .status(StatusCodes.OK)
        .json({ message: 'OTP verified successfully' });
};

const resetPassword = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError('Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new BadRequestError('Email is not registered');
    }

    // check if otp is expired
    if (user.forgotPasswordTokenExpires < Date.now()) {
        throw new BadRequestError('OTP has expired');
    }

    // update password
    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpires = undefined;
    await user.save();

    return res
        .status(StatusCodes.OK)
        .json({ message: 'Password changed successfully' });
};

// export functions

module.exports = {
    register,
    login,
    logout,
    checkAuth,
    uploadProfilePicture,
    createVerificationEmail,
    verifyEmail,
    forgotPassword,
    verifyOTP,
    resetPassword,
};
