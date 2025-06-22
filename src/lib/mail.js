const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

// transporter configuration
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Not your real Gmail password!
    },
};

const mailtrapConfig = {
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
};

// Create transporter
const transporter = nodemailer.createTransport(
    process.env.NODE_ENV === 'production' ? emailConfig : mailtrapConfig
);

const sendVerificationEmail = async (email, id) => {
    try {
        // Create verification token
        const verificationToken = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '10m', // 10 minutes
        });

        // Create verification email message
        const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
        const message = `
            <div style="font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #333;">
                <h1 style="color: #4169e1;">Email Verification</h1>
                <p>Thank you for registering with You & Me!</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationLink}" style="color: #4169e1; text-decoration: none;">Verify Email</a>
                <p>If the button above does not work, copy and paste the following link into your browser:</p>
                <p>${verificationLink}</p>
                <p><strong>Note:</strong> This verification link will expire in 10 minutes. Please verify your email before it becomes invalid.</p>
                <p>If you did not create this account, please ignore this email.</p>
                <p>Best regards,</p>
                <p>The You & Me Team</p>
            </div>
        `;

        // Send email
        const info = await transporter.sendMail({
            // from: `You & Me <${process.env.MAIL_USER}>`,
            from:
                process.env.NODE_ENV === 'production'
                    ? `You & Me <${process.env.MAIL_USER}>`
                    : 'You & Me <noreply@youandme.fake>',
            to: email,
            subject: 'Verify Your Email Address',
            html: message,
        });

        // Return token back to the controller
        return verificationToken;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

const sendOTPEmail = async (email) => {
    try {
        // Generate OTP
        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        // Create OTP email message
        const message = `
            <div style="font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #333;">
                <h1 style="color: #4169e1;">Your OTP Code</h1>
                <p>Thank you for using You & Me!</p>
                <p>Your One-Time Password (OTP) is:</p>
                <p style="font-size: 24px; font-weight: bold; color: #4169e1;">${otp}</p>
                <p><strong>Note:</strong> This OTP will expire in 10 minutes. Please use it before it becomes invalid.</p>
                <p>If you did not request this OTP, please ignore this email.</p>
                <p>Best regards,</p>
                <p>The You & Me Team</p>
            </div>
        `;

        // Send OTP to email
        const info = await transporter.sendMail({
            // from: `You & Me <${process.env.MAIL_USER}>`,
            from:
                process.env.NODE_ENV === 'production'
                    ? `You & Me <${process.env.MAIL_USER}>`
                    : 'You & Me <noreply@youandme.fake>',
            to: email,
            subject: 'Your OTP Code',
            html: message,
        });

        // Return OTP back to the controller
        return otp;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

module.exports = {
    sendVerificationEmail,
    sendOTPEmail,
};

// <button
//     onclick="navigator.clipboard.writeText('${otp}')"
//     style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 5px;">
//     Copy OTP to Clipboard
// </button>
