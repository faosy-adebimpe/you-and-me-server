const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
    {
        id: String,
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Sender ID is required'],
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Receiver ID is required'],
        },
        text: String,
        image: String,
        sent: {
            type: Boolean,
            default: true,
        },
        received: {
            type: Boolean,
            default: false,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Message = model('Message', messageSchema);

module.exports = Message;
