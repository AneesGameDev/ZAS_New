const mongoose = require("mongoose");
const Joi = require("joi");

const PaymentsSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
}, { timestamps: true });




const userPaymentsValidationSchema = Joi.object({
    senderId: Joi.string().hex().length(24).required(),
    receiverId: Joi.string().hex().length(24).required(),
    campaignId: Joi.string().hex().length(24).required(),
    amount: Joi.number().required(),
   
});

const ValidateUserPayments = (userPayments) => {
    return userPaymentsValidationSchema.validate(userPayments);
};



const Payments = mongoose.model('Payments', PaymentsSchema);

module.exports = {
    Payments,
    ValidateUserPayments
};
