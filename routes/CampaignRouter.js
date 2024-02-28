const express = require("express");
const { createCampaign , updateCampaign, getMyCampaignsByStatus ,deleteCampaign ,getAllCampaigns ,getCampaignById } = require("../Controllers/CampaignController");
const auth = require("../middlewares/auth");
const CampaignRouter = express.Router();

CampaignRouter.post("/create",auth, createCampaign);

CampaignRouter.get("/mycampaigns", auth, getMyCampaignsByStatus); //http://localhost:5000/api/userCampaign/mycampaigns?status=active
CampaignRouter.get("/campaigns", auth, getCampaignById); //http://localhost:5000/api/userCampaign/campaigns?campaignId=658709b83641d2dada6aa34c
CampaignRouter.get("/allcampaigns" ,auth, getAllCampaigns);//http://localhost:5000/api/userCampaign/allcampaigns
CampaignRouter.put("/update/:id",auth, updateCampaign);
CampaignRouter.delete("/deletecampaign/:id" , deleteCampaign);




module.exports = CampaignRouter;