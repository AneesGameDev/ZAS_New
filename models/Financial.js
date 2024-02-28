const mongoose = require("mongoose")
const Joi  =  require("joi");


const FinancialSchema = new mongoose.Schema({

    cash: {
        type: Number,
        default: 0,
        description: "Amount of cash in possession"
    },
    liabilities: {
        type: Number,
        default: 0,
        description: "Total liabilities or debts or Loan"
    },
    gold: {
        type: Number,
        default: 0,
        description: "Weight or value of gold assets Tollas"
    },
    silver: {
        type: Number,
        default: 0,
        description: "Weight or value of silver assets"
    },
    tradeGoods: {
        type: Number,
        default: 0,
        description: "Value of trade goods or inventory PKR"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });



const userFinancialValidationSchema = Joi.object({
    cash: Joi.number().default(0),
    liabilities: Joi.number().default(0),
    gold: Joi.number().default(0),
    silver: Joi.number().default(0),
    tradeGoods: Joi.number().default(0),
    userId: Joi.string().hex().length(24).required()
});

const ValidateUserFinancial =(userFinancial)=>{
    return userFinancialValidationSchema.validate(userFinancial);
};

const Financial = mongoose.model('Financial', FinancialSchema);
module.exports = {
    Financial,
    ValidateUserFinancial
};



