const cloudinary = require('cloudinary').v2;
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

const { BadRequestError } = require('../errors');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true, // Use secure URLs
});

uploadImage = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'you-and-me/images', // Optional: specify a folder in Cloudinary
            use_filename: true, // Use the original file name
            unique_filename: false, // Do not append a unique identifier to the file name
        });
        // return result; // Return the upload result
        return result.secure_url; // Return the upload result secure/https url
    } catch (error) {
        // console.error('Error uploading image to Cloudinary:', error);
        throw new BadRequestError(
            `Error uploading image to Cloudinary: ${error}`
        );
        // throw error; // Propagate the error
    }
};

module.exports = { cloudinary, uploadImage };
// This module exports the configured Cloudinary instance for use in other parts of the application.
