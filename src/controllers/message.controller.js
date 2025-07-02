const { StatusCodes } = require('http-status-codes');
const User = require('../models/user.model');
const Message = require('../models/message.model');
const { BadRequestError, NotFoundError } = require('../errors');
const { io, getSocketId } = require('../lib/socket');

const getUsers = async (req, res) => {
    const { _id: id } = req.user;
    const { username } = req.query;

    const queryObject = { _id: { $ne: id } };
    if (username) {
        queryObject.username = { $regex: username, $options: 'i' };
    }

    // const users = await User.find({ _id: { $ne: id } }).select('-password -__v');
    const users = await User.find(queryObject).select('-password -__v');
    res.status(StatusCodes.OK).json(users);
};

const getUser = async (req, res) => {
    const { userId: _id } = req.params;
    if (!_id) {
        throw new BadRequestError('User id not provided');
    }
    const user = await User.findOne({ _id }).select('-password -__v');
    if (!user) {
        throw new NotFoundError(`User with id <${_id}> not found`);
    }

    res.status(StatusCodes.OK).json(user);
};

const getMessages = async (req, res) => {
    const { receiverId } = req.params;
    const { _id: senderId } = req.user;

    if (!receiverId || !senderId) {
        throw new BadRequestError('IDs are required');
    }

    const messages = await Message.find({
        $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
        ],
    }).select('-__v');

    res.status(StatusCodes.OK).json(messages);
};

const getAllMessages = async (req, res) => {
    const { _id } = req.user;

    const unreadMessages = await Message.find({
        receiverId: _id,
    }).select('-__v');

    res.status(StatusCodes.OK).json(unreadMessages);
};

const getUnreadMessages = async (req, res) => {
    const { _id } = req.user;

    const unreadMessages = await Message.find({
        receiverId: _id,
        read: false,
    }).select('-__v');

    res.status(StatusCodes.OK).json(unreadMessages);
};

const readMessages = async (req, res) => {
    const { _id: receiverId } = req.user;
    const { senderId } = req.params;

    const messages = await Message.updateMany(
        { senderId, receiverId, read: false },
        { $set: { read: true } },
        { new: true }
    ).select('-__v');

    res.status(StatusCodes.OK).json(messages);
};

const sendMessage = async (req, res) => {
    const { receiverId } = req.params;
    const { _id: senderId } = req.user;
    const { text, image } = req.body;

    if (!text && !image) {
        throw new BadRequestError('Please provide message (text or image)');
    }

    const messageObject = { senderId, receiverId };
    if (text) {
        messageObject.text = text;
    }

    if (image) {
        messageObject.image = image;
    }

    const message = await Message.create(messageObject);

    const newMessageObject = message.toObject();
    delete newMessageObject.__v;

    const socketId = getSocketId(receiverId);
    if (socketId) {
        // console.log({socketId});
        io.to(socketId).emit('new-message', newMessageObject);
        // console.log(io);
    }

    res.status(StatusCodes.OK).json(newMessageObject);

    // todo: add realtime with socket.io
};

module.exports = {
    getUsers,
    getUser,
    getMessages,
    getAllMessages,
    getUnreadMessages,
    readMessages,
    sendMessage,
};
