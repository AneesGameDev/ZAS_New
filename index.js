const express = require("express");
const userRouter = require("./routes/userRoutes");
const financialRouter = require("./routes/FinancialRouter");
const campaignRouter = require("./routes/CampaignRouter")
const paymentRouter = require("./routes/PaymentsRouter")
const feedbackRouter = require("./routes/FeedbackRouter");
const educationalRouter =require("./routes/EducationalRouter");
const mongoose = require("mongoose");
const app  = express();
app.use(express.json());
require('dotenv').config();

app.use("/api/users" , userRouter);
app.use("/api/financial" , financialRouter);
app.use("/api/campaign" , campaignRouter);
app.use("/api/payments" , paymentRouter);
app.use("/api/feedback" , feedbackRouter);
app.use("/api/educational" , educationalRouter);



mongoose.connect("mongodb+srv://aneesnarsun:aneesnarsun@zasfyp.mwq4dpv.mongodb.net/")
.then(()=>{
const Port = process.env.PORT || 5000;
app.listen(Port,()=>{
    console.log("5000 , Port Server Start ..........");
})
}).catch((error)=>{
    console.log(error);
})


