class CustomError extends Error {
    constructor(message) {
        super(message);
    }
}

module.exports = CustomError;

// class CustomError {
//     constructor(message, statusCode) {
//         this.message = message;
//         this.statusCode = statusCode;
//     }

//     static badRequest(message) {
//         return new CustomError(message, 400);
//     }

//     static unauthorized(message) {
//         return new CustomError(message, 401);
//     }

//     static forbidden(message) {
//         return new CustomError(message, 403);
//     }

//     static notFound(message) {
//         return new CustomError(message, 404);
//     }

//     static internalServerError(message) {
//         return new CustomError(message, 500);
//     }
// }
