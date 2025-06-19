const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// create user schema
const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        maxlength: [50, 'Username cannot be more than 20 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$/,
            'Please provide a valid email',
        ],
    },

    // other infos
    firstName: String,
    middleName: String,
    lastName: String,
    gender: String,
    image: String,

    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password cannot be less than 6 characters'],
    },
    acceptTerms: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'staff', 'user'],
            message: '{VALUE} is not a valid role',
        },
        default: 'user',
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    forgotPasswordToken: String,
    forgotPasswordTokenExpires: Date,
});

// hash password before saving user to database
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// hash password before saving it to the database
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
});

// compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// create JWT
userSchema.methods.createJWT = function () {
    return jwt.sign(
        {
            userId: this._id,
            username: this.username,
            acceptTerms: this.acceptTerms,
            role: this.role,
            verified: this.verified,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    );
};

// create cookie
userSchema.methods.createCookie = function (res) {
    const tokenData = {
        _id: this._id,
        username: this.username,
        email: this.email,
        image: this.image,
        acceptTerms: this.acceptTerms,
        role: this.role,
        verified: this.verified,
    };

    // const userObject = {...this};
    // delete userObject.password;

    // const tokenData = {
    //     _id: this._id,
    //     username: this.username,
    //     email: this.email,
    //     acceptTerms: this.acceptTerms,
    //     role: this.role,
    //     verified: this.verified,
    // };

    const authToken = jwt.sign(tokenData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });
    res.cookie('auth-token', authToken, {
        httpOnly: true,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
};

// create user model
const User = model('User', userSchema);

// export user model
module.exports = User;
