// modules
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');
const cookieParser = require('cookie-parser');
const connect = require('./lib/connect');
const { express, app, server } = require('./lib/socket');
const alwaysLive = require('./lib/always-live');

// consume immediate module
require('express-async-errors');
require('dotenv').config();

// variables
const PORT = process.env.PORT || 5000;
const DOMAIN = process.env.DOMAIN || 'http://127.0.1';

// middleware
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.FRONTEND_URL,
        ],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

// import routes
const authRouter = require('./routes/auth.route');
const messageRouter = require('./routes/message.route');
const notFoundMiddleware = require('./middlewares/not-found.middleware');
const errorHandlerMiddleware = require('./middlewares/error-handler.middleware');

// routes
app.get('/', (req, res) => {
    res.status(StatusCodes.OK).send('Welcome to the home page...');
});

// use routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/message', messageRouter);

// not found middleware
app.use(notFoundMiddleware); // 404 page not found

// error handler middleware
app.use(errorHandlerMiddleware); // 500 internal server error

// create start function, (connect to the database before starting server)
const start = async () => {
    try {
        await connect(process.env.MONGO_URI);
        // console.log('Connected to the database...');

        // start server
        server.listen(PORT, () => {
            // console.log(
            //     `Server is running on port ${
            //         process.env.NODE_ENV === 'development' ? 'https' : 'http'
            //     }://127.0.0.1:${PORT}...`
            // );
            console.log(`Server is running on: ${DOMAIN}:${PORT}...`);

            if (process.env.NODE_ENV === 'production') {
                alwaysLive();
            }
        });
    } catch (error) {
        console.log(error);
    }
};

// start server
start();
