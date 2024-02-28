const express = require("express");
const { createPayment, getSentPayments, getReceivedPayments  , getAllPayments} = require("../Controllers/PaymentController");
const auth = require("../middlewares/auth");
const paymentRouter = express.Router();

// Create Payment
paymentRouter.post("/create", auth, createPayment);

// Get Payments Sent by a User
paymentRouter.get("/sent", auth, getSentPayments);

// Get Payments Received by a User
paymentRouter.get("/received", auth, getReceivedPayments);

paymentRouter.get("/allpayments", auth, getAllPayments);


module.exports = paymentRouter;
