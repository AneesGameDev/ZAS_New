const { User } = require("../models/user");
const { ZakatCampaign } = require("../models/ZakatCampaign");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// const createCampaign = async (req, res) => {

//     const { title, description, desiredAmount, raisedAmount, imageUrls, address, UniqueId } = req.body;
//     const userId = req.userId;

//     try {
//         // Check if the user exists in the UserFinancial collection
//         const existingUser = await User.findOne({ _id: userId });

//         if (!existingUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Create a new campaign if the user exists
//         const newCampaign = await ZakatCampaign.create({
//             userId,
//             title,
//             description,
//             desiredAmount,
//             raisedAmount:0,
//             imageUrls: req.imageUrls,
//             address,
//             UniqueId

            
//         });

//         res.status(201).json(newCampaign);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error creating campaign' });
//     }
//};
const createCampaign = async (req, res) => {
    const { title, description, desiredAmount, imageUrls, address, UniqueId } = req.body;
    const userId = req.userId;

    try {
        // Check if the user exists in the User collection
        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new campaign
        const newCampaign = await ZakatCampaign.create({
            userId,
            title,
            description,
            desiredAmount,
            raisedAmount: 0,
            imageUrls,
            address,
            UniqueId
        });

        res.status(201).json({
            message: 'Campaign created successfully', // Success message
            campaign: newCampaign // The created campaign object
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating campaign' });
    }
};

module.exports = { createCampaign };


const updateCampaign = async (req,res)=>{

    const campaignId = req.params.id;
    const userId = req.userId;
    const updateFields = req.body;  // Request body contains only the fields to update

    try {
                // Check if the user exists in the UserFinancial collection
        const existingUser = await User.findOne({ _id: userId });

        const existingCampaign = await ZakatCampaign.findById({ _id : campaignId });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        

        if (!existingCampaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Update only the specified fields, leave others unchanged
        existingCampaign.title = updateFields.title || existingCampaign.title;
        existingCampaign.description = updateFields.description || existingCampaign.description;
        existingCampaign.desiredAmount = updateFields.desiredAmount || existingCampaign.desiredAmount;
      //  existingCampaign.raisedAmount = updateFields.raisedAmount || existingCampaign.raisedAmount;
        existingCampaign.imageUrls = updateFields.imageUrls || existingCampaign.imageUrls;
        existingCampaign.address = updateFields.address || existingCampaign.address;

        const updatedCampaign = await existingCampaign.save();

        res.status(200).json(updatedCampaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating campaign' });
    }
};


const getAllCampaigns = async (req, res) => {

    try {
        // Find all campaigns excluding completed and inactive ones
        const zakatCampaigns = await ZakatCampaign.find({
            status: { $nin: ['completed', 'inactive'] }
        }).sort({ createdAt: -1 });  // Sort by creation date in descending order

        // Return the response with the same structure as the previous function
        res.status(200).json({ items: zakatCampaigns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching campaigns' });
    }
};


//const getAllCampaigns = async (req, res) => {

//    const page = parseInt(req.query.page) || 1;
//    const limit = 10;  // Number of campaigns per page

//    try {
        // Find all campaigns with pagination and exclude completed and inactive campaigns
//        const zakatCampaigns = await ZakatCampaign.find({
//            status: { $nin: ['completed', 'inactive'] }
//        })
//            .skip((page - 1) * limit)
//            .limit(limit)
//            .sort({ createdAt: -1 }); // Sort by creation date in descending order

//        res.status(200).json(zakatCampaigns);
//    } catch (error) {
//        console.error(error);
//        res.status(500).json({ message: 'Error fetching campaigns' });
//    }
//};

// const getMyCampaignsByStatus = async (req, res) => {

//     const userId = req.userId;
//     const { status } = req.query;

//     try {
//         if (userId && status) {
//             // If status parameter is provided, retrieve campaigns based on status for the logged-in user
//             let query = { userId };

//             // Add status filter if provided
//             if (status) {
//                 query.status = status;
//             }

//             const zakatCampaigns = await ZakatCampaign.find(query).sort({ createdAt: -1 });
//             res.status(200).json(zakatCampaigns);
//         }
//         else {
//             // If neither status nor campaignId is provided, return an error
//             return res.status(400).json({ message: 'Please provide either status or campaignId parameter' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error fetching campaigns' });
//     }
// };
const getMyCampaignsByStatus = async (req, res) => {
    const userId = req.userId;
    const { status } = req.query;

    try {
        if (userId && status) {
            // Build the query with userId and status
            let query = { userId };

            if (status) {
                query.status = status;
            }

            // Retrieve campaigns based on the query
            const zakatCampaigns = await ZakatCampaign.find(query).sort({ createdAt: -1 });

            // Respond with the campaigns wrapped in an object
            res.status(200).json({ items: zakatCampaigns });
        } else {
            // Return an error if parameters are missing
            return res.status(400).json({ message: 'Please provide both userId and status parameters' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching campaigns' });
    }
};


const getCampaignById = async (req, res) => {

    const userId = req.userId;
    const { campaignId } = req.query;

    try {
    if(userId && campaignId) {
        // If campaignId parameter is provided, retrieve a specific campaign by campaignId
        const specificCampaign = await ZakatCampaign.findOne({ _id: campaignId });
    
        if (!specificCampaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
    
        res.status(200).json(specificCampaign);
    }else{
        return res.status(400).json({ message: 'Please provide either status or campaignId parameter' });
    }
    }catch(error){
        
            console.error(error);
            res.status(500).json({ message: 'Error fetching campaigns' });
    }
}
    




const deleteCampaign = async (req, res) => {
    const campaignId = req.params.id;

    try {
        // Check if the campaign exists
        const existingCampaign = await ZakatCampaign.findById(campaignId);

        if (!existingCampaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Delete the campaign
        await existingCampaign.deleteOne();

        res.status(200).json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error in deleteCampaign:', error);
        res.status(500).json({ message: 'Error deleting campaign' });
    }
};





module.exports = { createCampaign, updateCampaign ,getMyCampaignsByStatus,getCampaignById , deleteCampaign , getAllCampaigns};
