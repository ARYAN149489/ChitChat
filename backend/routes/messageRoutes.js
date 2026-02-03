const express = require('express');
const Message = require('../models/ChatModel');
const { protect } = require('../middleware/authMiddleware');

const messageRouter = express.Router();

// send message
messageRouter.post('/', protect, async (req, resp) => {
    try {
        const { content, groupId } = req.body;
        const message = await Message.create({
            sender: req.user._id,
            content,
            group: groupId,
        })
        const populatedMessage = await Message.findById(message._id).populate("sender", "username email");
        resp.json(populatedMessage);
    } catch (error) {
        resp.status(400).json({ message: error.Message });
    }
})

// get messages for a group
messageRouter.get('/:groupId', protect, async (req, resp) => {
    try {
        const messages = await Message.find({ group: req.params.groupId })
            .populate("sender", "username email")
            .sort({ createdAt: 1 }); // Sort ascending (oldest first)
        resp.json(messages);
    } catch (error) {
        resp.status(400).json({ message: error.Message });
    }
})
module.exports = messageRouter;