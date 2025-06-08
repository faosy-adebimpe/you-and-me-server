const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
    {
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
    },
    { timestamps: true }
);

const Message = model('Message', messageSchema);

module.exports = Message;
