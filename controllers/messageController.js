import express from "express";
import validateToken from "../middleware/validateToken.js";
import Message from "../models/message.js";
import Profile from "../models/profile.js";

const router = express.Router();

router.post("/profiles/:id/messages", validateToken, async (req, res, next) => {
    try {
        const recipientId = req.params.id;
        const senderId = req.user.profile;

        const senderProfile = await Profile.findById(senderId);
        const recipientProfile = await Profile.findById(recipientId);

        if (
            !senderProfile.matches.includes(recipientId) &&
            !recipientProfile.matches.includes(senderId)
        ) {
            return res.status(403).json({
                message: "⛔️ You can only message profiles you've matched with!",
            });
        }

        const newMessage = await Message.create({
            content: req.body.content,
            author: senderId,
            recipient: recipientId,
        });

        return res.status(201).json({
            message: "💬 Message sent successfully!",
            newMessage,
        });
    } catch (error) {
        next(error);
    }
});

router.get("/profiles/:id/messages", validateToken, async (req, res, next) => {
    try {
        const recipientId = req.params.id;
        const senderId = req.user.profile;

        const senderProfile = await Profile.findById(senderId);
        const recipientProfile = await Profile.findById(recipientId);

        if (
            !senderProfile.matches.includes(recipientId) &&
            !recipientProfile.matches.includes(senderId)
        ) {
            return res.status(403).json({
                message: "⛔️ You can only view messages from profiles you've matched with!",
            });
        }

        const messages = await Message.find({
            $or: [
                { author: req.user.profile, recipient: recipientId },
                { author: recipientId, recipient: req.user.profile },
            ],
        }).populate("author").populate("recipient");

        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
});

export default router;