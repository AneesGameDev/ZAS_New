const mongoose = require('mongoose');
const { Payments } = require('../models/Payments');
const { ZakatCampaign } = require('../models/ZakatCampaign');
const {User} = require("../models/user")


/*
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
*/

const createPayment = async (req, res) => {
    const userId = req.userId;  // The sender's user ID (the one making the payment)
    const senderId = userId;    // Sender ID

    const { campaignId, amount } = req.body;  // Extract campaign ID and amount from the request body

    console.log("Received Request:");
    console.log(`User ID (Sender): ${userId}`);
    console.log(`Campaign ID: ${campaignId}`);
    console.log(`Amount: ${amount}`);

    try {
        // 1. Find the campaign by the given campaignId
        console.log("Fetching Campaign...");
        const campaign = await ZakatCampaign.findById(campaignId);
        if (!campaign) {
            console.log("Campaign not found");
            return res.status(404).json({ message: 'Campaign not found' });
        }
        console.log("Campaign Found: ", campaign);

        // 2. The receiver of the payment is the campaign owner (identified by UniqueId)
        const receiverId = campaign.userId;  // This is the campaign owner's ID (UniqueId)
        console.log(`Receiver ID (Campaign Owner): ${receiverId}`);

        // 3. Check if the sender exists
        console.log("Checking if Sender Exists...");
        const existingSender = await User.findById(senderId);
        if (!existingSender) {
            console.log("Sender not found");
            return res.status(404).json({ message: 'Sender not found' });
        }
        console.log("Sender Found: ", existingSender);

        // 4. Check if the receiver exists (the owner of the campaign)
        console.log("Checking if Receiver Exists...");
        const existingReceiver = await User.findById(receiverId);
        if (!existingReceiver) {
            console.log("Receiver (Campaign Owner) not found");
            return res.status(404).json({ message: 'Receiver (campaign owner) not found' });
        }
        console.log("Receiver Found: ", existingReceiver);

        // 5. Check if the campaign exists (repeated check after the initial one)
        console.log("Checking if Campaign Exists...");
        // const existingCampaign = await ZakatCampaign.findById(campaignId);
        // if (!existingCampaign) {
        //     console.log("Campaign not found");
        //     return res.status(404).json({ message: 'Campaign not found' });
        // }
        // console.log("Campaign Exists: ", existingCampaign);

        const paymentData = {
            senderId: new mongoose.Types.ObjectId(senderId),  // Convert senderId to ObjectId if not already
            receiverId, // Convert receiverId to ObjectId if not already
            campaignId: new mongoose.Types.ObjectId(campaignId), // Convert campaignId to ObjectId if not already
            amount,     // The amount of money being paid
        };

        // 6. Create a new payment record
        console.log("Creating new Payment...",paymentData);
        const newPayment = await Payments.create(paymentData);
        console.log("New Payment Created: ", newPayment);

        // 7. Update the raisedAmount in the campaign to reflect the payment
        console.log("Updating Raised Amount in Campaign...");
        const updatedCampaign = await ZakatCampaign.findByIdAndUpdate(
            { _id: campaignId },
            { $inc: { raisedAmount: amount } },  // Increment the raisedAmount with the payment amount
            { new: true }
        );
        console.log("Updated Campaign: ", updatedCampaign);

        // 8. Check if the raised amount is greater than or equal to the desired amount
        console.log("Checking if raisedAmount is >= desiredAmount...");
        if (updatedCampaign.raisedAmount >= updatedCampaign.desiredAmount) {
            console.log("Campaign raised amount meets or exceeds desired amount. Marking as completed.");
            // If the raised amount meets or exceeds the desired amount, set the campaign status to 'completed'
            updatedCampaign.status = 'completed';
            await updatedCampaign.save();  // Save the updated campaign
            console.log("Campaign Status updated to 'completed'");
        }

        // 9. Return the newly created payment and the updated campaign
        console.log("Returning Response...");
        res.status(201).json({ newPayment, updatedCampaign });

    } catch (error) {
        console.error("Error during payment creation:", error);
        res.status(500).json({ message: 'Error creating payment' });
    }
};



/*
const createPayment = async (req, res) => {
    try {
        const senderId = req.userId; // Assuming sender's ID is retrieved from the authenticated user
        const { campaignId, amount } = req.body;

        // Validate required fields
        if (!campaignId || !amount) {
            return res.status(400).json({ message: 'Campaign ID and amount are required.' });
        }

        // Check if sender exists
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found.' });
        }

        // Check if the campaign exists
        const campaign = await ZakatCampaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        // Retrieve the receiver ID from the campaign
        const receiverId = campaign.userId; // Assuming the campaign model has a userId field
        if (!receiverId) {
            return res.status(404).json({ message: 'Campaign receiver not found.' });
        }

        // Create a new payment
        const newPayment = await Payments.create({
            senderId,
            receiverId,
            campaignId,
            amount,
        });

        // Update the raised amount in the campaign
        const updatedCampaign = await ZakatCampaign.findByIdAndUpdate(
            campaignId,
            { $inc: { raisedAmount: amount } },
            { new: true }
        );

        // If the raised amount meets or exceeds the desired amount, mark the campaign as completed
        if (updatedCampaign.raisedAmount >= updatedCampaign.desiredAmount) {
            updatedCampaign.status = 'completed';
            await updatedCampaign.save();
        }

        // Respond with the newly created payment and updated campaign
        return res.status(201).json({
            message: 'Payment successfully created.',
            payment: newPayment,
            campaign: updatedCampaign,
        });
    } catch (error) {
        console.error('Error creating payment:', error);

        // Handle duplicate key errors specifically
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate key error. Please check the unique fields.',
                details: error.keyValue,
            });
        }

        // Generic error response
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

*/

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
