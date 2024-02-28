const { Feedback } = require("../models/Feedback");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();


const getFeedbacks = async (req, res) => {
    try {
        // Find all feedbacks and sort by the number of likes in descending order
        const allFeedbacks = await Feedback.find()
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json(allFeedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching feedbacks' });
    }
};


const createFeedback = async (req, res) => {
    const userId = req.userId;

    try {
        const { title, description, rating } = req.body;

        const newFeedback = await Feedback.create({
            userId,
            title,
            description,
            rating,
        });

        res.status(201).json(newFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating feedback' });
    }
};


const actionFeedback = async (req, res) => {

    const userId = req.userId;

    const {feedbackId} = req.query;
    const { action } = req.query; // action can be 'like' or 'dislike'

    try {
        if(feedbackId && action){
        // Find the feedback to like or dislike
        const feedback = await Feedback.findById({_id : feedbackId});
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Check if the user has already liked or disliked the feedback
        const hasLiked = feedback.likes.some((like) => like.userId.equals(userId));
        const hasDisliked = feedback.dislikes.some((dislike) => dislike.userId.equals(userId));

        // Perform the action based on user's choice
        if (action === 'like') {
            if (!hasLiked) {
                feedback.likes.push({ userId });
                // If the user has disliked the feedback before, remove the dislike
                if (hasDisliked) {
                    feedback.dislikes = feedback.dislikes.filter((dislike) => !dislike.userId.equals(userId));
                }
                await feedback.save();
            }
        } else if (action === 'dislike') {
            if (!hasDisliked) {
                feedback.dislikes.push({ userId });
                // If the user has liked the feedback before, remove the like
                if (hasLiked) {
                    feedback.likes = feedback.likes.filter((like) => !like.userId.equals(userId));
                }
                await feedback.save();
            }
        } else {
            return res.status(400).json({ message: 'Invalid action. Use "like" or "dislike".' });
        }

        res.status(200).json({ message: `${action} action successful` });
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error performing action on feedback' });
    }
};




module.exports = { getFeedbacks, actionFeedback ,createFeedback};
