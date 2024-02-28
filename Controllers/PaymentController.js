const mongoose = require('mongoose');
const { Payments } = require('../models/Payments');
const { ZakatCampaign } = require('../models/ZakatCampaign');
const {User} = require("../models/user")



const createPayment = async (req, res) => {
    const userId = req.userId;
    const senderId = userId;
    const { receiverId, campaignId, amount } = req.body;

    try {
        // Check if the campaign exists
        const existingSender = await User.findById({ _id: senderId });
        if (!existingSender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        // Check if the receiver exists in the user schema
        const existingReceiver = await ZakatCampaign.findOne({ userId: receiverId });
        if (!existingReceiver) {
            return res.status(404).json({ message: 'Receiver Of Campaign not found' });
        }

        // Check if the campaign exists
        const existingCampaign = await ZakatCampaign.findById({ _id: campaignId });
        if (!existingCampaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Create a new payment
        const newPayment = await Payments.create({
            senderId,
            receiverId,
            campaignId,
            amount,
        });

        // Update the raisedAmount in the UserCampaign model
        const updatedCampaign = await ZakatCampaign.findByIdAndUpdate(
            { _id: campaignId },
            { $inc: { raisedAmount: amount } },
            { new: true }
        );

        // Check if raised amount is greater than or equal to desired amount
        if (updatedCampaign.raisedAmount >= updatedCampaign.desiredAmount) {
            // If so, set the campaign status to 'completed'
            updatedCampaign.status = 'completed';
            await updatedCampaign.save();
        }

        res.status(201).json({ newPayment, updatedCampaign });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating payment' });
    }
};


// Get Payments Sent by a User
const getSentPayments = async (req, res) => {
    const userId = req.userId;

    try {
        // Find payments sent by the specified user
        const sentPayment = await Payments.find({ senderId: userId });

        res.status(200).json(sentPayment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching sent payments' });
    }
};

// Get Payments Received by a User
const getReceivedPayments = async (req, res) => {
    const userId = req.userId;

    try {
        // Find payments received by the specified user
        const receivedPayment = await Payments.find({ receiverId: userId });

        res.status(200).json(receivedPayment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching received payments' });
    }
};

const getAllPayments = async (req, res) => {

    try {
        // Find all campaigns with pagination
        const userPayment = await Payments.find().sort({ createdAt: -1 }); // Sort by creation date in descending order

        res.status(200).json(userPayment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching all campaigns' });
    }
};

module.exports = {
    createPayment,
    getSentPayments,
    getReceivedPayments,
    getAllPayments,
};
