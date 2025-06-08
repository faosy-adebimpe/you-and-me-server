const express = require('express');

// create router
const router = express.Router();

// import controllers
const {
    getUsers,
    getUser,
    getMessages,
    sendMessage,
} = require('../controllers/message.controller');

// import middlewares
const authenticated = require('../middlewares/authenticated.middleware');
router.use(authenticated);

// create routes
router.route('/users').get(getUsers);
router.route('/users/:userId').get(getUser);
router.route('/:receiverId').get(getMessages);
router.route('/send/:receiverId').post(sendMessage);

// export router
module.exports = router;
