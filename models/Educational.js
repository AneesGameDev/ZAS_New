const mongoose = require('mongoose');
const Joi = require('joi');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['educational', 'faq'],
        required: true,
    },
    // Other common fields if any
}, { timestamps: true });

const Eudcational = mongoose.model('Educational', contentSchema);

// Joi validation schema for creating content
const contentValidationSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('educational', 'faq').required(),
    // Other common fields if any
});

// Joi validation function
const validateContent = (content) => {
    return contentValidationSchema.validate(content);
};

module.exports = {
    Eudcational,
    validateContent,
};
