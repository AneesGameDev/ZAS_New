const { Financial } = require("../models/Financial");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();



const getFinancial = async (req, res) => {

    const { cash, liabilities, gold, silver, tradeGoods } = req.body;
    
    const userId = req.userId;

    try {
        const filter = { userId }; // Assuming 'userId' is the correct field to identify the user

        const existingUserFinancial = await Financial.findOne(filter);

        if (existingUserFinancial) {
            // Print the existing data without updating
            console.log(existingUserFinancial);
            res.status(200).json(existingUserFinancial);
        } else {
            // Create new data
            const newFinancialData = {
                cash,
                liabilities,
                gold,
                silver,
                tradeGoods,
                userId
            };

            const createdFinancialData = await Financial.create(newFinancialData);
            res.status(201).json(createdFinancialData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }

};


const createupdateFinancial = async (req, res) => {
    const { cash, liabilities, gold, silver, tradeGoods } = req.body;
    const userId = req.userId;

    try {
        const filter = { userId }; // Assuming 'userId' is the correct field to identify the user

        const existingUserFinancial = await Financial.findOne(filter);

        const newFinancialData = {
            cash,
            liabilities,
            gold,
            silver,
            tradeGoods,
            userId
        };

        if (existingUserFinancial) {
            // Update Data 
            const updatedFinancialData = await Financial.findOneAndUpdate(filter, newFinancialData, { new: true });
            res.status(200).json(updatedFinancialData);
        } else {
            // Create new data
            const createdFinancialData = await Financial.create(newFinancialData);
            res.status(201).json(createdFinancialData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};



module.exports = { getFinancial , createupdateFinancial}//getFinancial , createupdateFinancial };
