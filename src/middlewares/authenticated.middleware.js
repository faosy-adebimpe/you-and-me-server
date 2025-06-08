const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const authenticated = (req, res, next) => {
    const authToken = req.cookies['auth-token'];

    if (!authToken) {
        throw new UnauthenticatedError('Authorization token not provided');
    }

    try {
        const tokenData = jwt.verify(authToken, process.env.JWT_SECRET);
        req.user = tokenData;
    } catch (error) {
        throw new UnauthenticatedError('Invalid token or token expired');
        // console.log({ error });
        // next(error);
        // return;
    }

    next();
};

module.exports = authenticated;
