const express = require("express");
const { createFeedback, getFeedbacks, actionFeedback} = require("../Controllers/FeedbackController");
const auth = require("../middlewares/auth");
const FeedbackRouter = express.Router();

// Create Payment
FeedbackRouter.post("/create", auth, createFeedback);


// Get Payments Sent by a User
FeedbackRouter.get("/", auth, getFeedbacks);

// Get Payments Received by a User
FeedbackRouter.post("/", auth, actionFeedback);


module.exports = FeedbackRouter;
