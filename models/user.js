const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    profileImage: {
        type: String
    },
    bio: {
        type: String
    },
    contactNumber: {
        type: String,
    },
    address: {
        type: String,
    },
    verified: {
        type: Boolean,
        default: false
    },
    verification: {
        otp: String,
        expiresAt: Date
    },
    statusActive:{
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['Admin', 'ZakatTaker', 'ZakatGiver']
    }
}, { timestamps: true });

const User = mongoose.model('users', userSchema);

// Joi validation schema
const userValidationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    profileImage: Joi.string(),
    bio: Joi.string(),
    contactNumber: Joi.string(),
    address: Joi.string(),
    verified: Joi.boolean().default(false),
    verification: Joi.object({
        otp: Joi.string(),
        expiresAt: Joi.date()
    }),
    statusActive: Joi.boolean().default(false),
    role: Joi.string().valid('Admin', 'ZakatTaker', 'ZakatGiver')
});

const userUpdateValidationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    profileImage: Joi.string(),
    bio: Joi.string(),
    contactNumber: Joi.string(),
    address: Joi.string()
});

// Validate user data against the schema
const validateUser = (user) => {
    return userValidationSchema.validate(user);
};

const validateUpdateUser = (user)=>{
    return userUpdateValidationSchema.validate(user);
}

module.exports = {
    User,
    validateUser,
    validateUpdateUser
};
