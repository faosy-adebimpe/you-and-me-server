const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const authenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new UnauthenticatedError('Authorization token not provided');
    }

    const [bearer, token] = authHeader.split(' ');
    if (!bearer || !token) {
        throw new UnauthenticatedError('Invalid token format: Bearer <token>');
    }

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
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
