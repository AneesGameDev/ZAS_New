const express = require("express");
const auth = require("../middlewares/auth")
const { signin, signup,siginbyjwt,getUsersForAdmin, updateProfile,getProfileImage, sendOTPAndVerified, verifyOTPAndSetActivate , resetPasswordRequest ,matchOTPsetNewPassword } = require("../Controllers/userController");  // Updated import statement
const { ImgUpload } = require("../middlewares/ImgUpload");
const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.post("/signinbyjwt",auth, siginbyjwt);
userRouter.post("/getUsersForAdmin",auth, getUsersForAdmin);
userRouter.post("/updateProfile", auth, ImgUpload.single("profileImage"), updateProfile)
userRouter.get('/getProfileImage', auth, getProfileImage);
userRouter.post('/sendVerifiedOTP' , sendOTPAndVerified);
userRouter.post('/verifyOTP' , verifyOTPAndSetActivate);
userRouter.post('/requestResetPassword' , resetPasswordRequest);
userRouter.post('/matchOTPsetNewPassword' , matchOTPsetNewPassword);

module.exports = userRouter;
