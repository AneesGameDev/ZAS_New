const mongoose = require('mongoose');
const Joi = require('joi');

const CampaignSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    desiredAmount: {
        type: Number,
        required: true
    },
    raisedAmount: {
        type: Number,
        default: 0
    },
    imageUrls: {
        type: [String],
        default: []
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active'
    }
}, { timestamps: true });

// Joi validation schema
const campaignValidationSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    desiredAmount: Joi.number().required(),
    raisedAmount: Joi.number().default(0),
    imageUrls: Joi.array().items(Joi.string()),
    address: Joi.string().required(),
    status: Joi.string().valid('active', 'inactive', 'completed').default('active')
});

// Joi validation function
const validateCampaign = (userCampaign) => {
    return campaignValidationSchema.validate(userCampaign);
};

const ZakatCampaign = mongoose.model('zakatCampaign', CampaignSchema);

module.exports = {
    ZakatCampaign,
    validateCampaign
};
