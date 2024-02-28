const mongoose = require('mongoose');
const Joi = require('joi');

const feedbackSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    likes: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        },
    ],
    dislikes: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        },
    ],
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Joi validation schema for creating feedback
const feedbackValidationSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    rating: Joi.number().min(0).max(5).default(0),
});

// Joi validation function
const validateFeedback = (feedback) => {
    return feedbackValidationSchema.validate(feedback);
};

module.exports = {
    Feedback,
    validateFeedback,
};
