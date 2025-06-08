const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
    // console.log(err);

    const defaultError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message:
            err.message || 'Something went wrong, please try again later...',
    };

    if (err.name === 'ValidationError') {
        defaultError.statusCode = 400;
        // defaultError.message = err.message;
        defaultError.message = err.errors.email.message;
    }

    if (err.code && err.code === 11000) {
        defaultError.statusCode = 400;
        defaultError.message = `Duplicate value entered for ${Object.keys(
            err.keyValue
        )} field, please choose another value...`;
    }

    if (err.name === 'CastError') {
        defaultError.statusCode = 404;
        defaultError.message = `No item found with id: ${err.value}`;
    }

    return res
        .status(defaultError.statusCode)
        .json({ message: defaultError.message });
};

module.exports = errorHandlerMiddleware;
