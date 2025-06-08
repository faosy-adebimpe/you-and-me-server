const CustomError = require('./custom.error');
const BadRequestError = require('./bad-request.error');
const NotFoundError = require('./not-found.error');
const UnauthenticatedError = require('./unauthorized.error');

module.exports = {
    CustomError,
    BadRequestError,
    NotFoundError,
    UnauthenticatedError,
};
