const { User  ,validateUser , validateUpdateUser} = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require('joi');
const nodemailer = require('nodemailer');
const path = require("path"); // Import the path module
const fs = require("fs");
require('dotenv').config();


const SECRET_KEY = process.env.SECRET_KEY;

const signup = async (req, res) => {
    const { firstName, lastName, email, password, profileImage, bio, contactNumber, address , role} = req.body;
    
    try {
        const existingUser = await User.findOne({ email: email });
        
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profileImage,
            bio,
            contactNumber,
            address,
            role
        });

       
        
       // return res.status(401).json({ message: "User is created successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const siginbyjwt = async (req, res) => {
    // Assuming `req.user` contains the userId from the JWT token

    const userId = req.userId;

    try {
        const user = await User.findById(userId); // Find the user by ID from the database

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare and return the user profile data
        const userProfileData = {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImage: user.profileImage,
            bio: user.bio,
            contactNumber: user.contactNumber,
            address: user.address,
            verified: user.verified,
            statusActive: user.statusActive,
            role: user.role
        };

        res.status(200).json({ user: userProfileData });
    } catch (error) {
        console.error('Profile Fetch Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Middleware to verify if the user is authenticated and an admin
const getUsersForAdmin = async (req, res, next) => {


    
    const userId = req.userId;

    try {
        const user = await User.findById(userId); // Find the user by ID from the database

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

            if (user.role !== 'Admin') {
                return res.status(403).json({ message: "Unauthorized - Admin access required" });
            }

 
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }



    try {
        const users = await User.find(); // You might want to select specific fields only

        // Optionally, filter out sensitive information before sending the users data
        const usersData = users.map(user => ({
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImage: user.profileImage,
            bio: user.bio,
            contactNumber: user.contactNumber,
            address: user.address,
            verified: user.verified,
            statusActive: user.statusActive,
            role: user.role
        }));

        res.status(200).json({ AllUsers: usersData });
       // res.status(200).json( usersData);
    } catch (error) {
        console.error('GetUsersForAdmin Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};



// Function to generate a random 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

// Function to send OTP via email
const sendOTP = async (email, otp) => {
    // You need to replace the placeholder values with your own email configuration
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "ockmicrosoft.games@gmail.com",
            pass: "gjpi iuqz jsla mkxy"

        }
    });

    const mailOptions = {
        from: 'ockmicrosoft.games@gmail.com',
        to: email,
        subject: 'Zakat Automation System Verification OTP',
        text: `Your OTP for email verification is: ${otp}. It will expire in 24 hours.`
    };

    await transporter.sendMail(mailOptions);
};

// Joi schema for the API request
const sendOTPSchema = Joi.object({
    email: Joi.string().email().required()
});

const sendOTPAndVerified = async (req, res) => {
    const { email } = req.body;

    // Validate the input data
    const { error } = sendOTPSchema.validate({ email });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp.toString(), 10);

        // Update user data with OTP and set statusActive to true
        await User.updateOne({ email }, {
            $set: {
                verification: {
                    otp: hashedOTP,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiration
                },
                verified: true // Set statusActive to true directly
            }
        });

        // Send OTP via email
        await sendOTP(email, otp);

        res.status(200).json({ message: "OTP sent successfully User Verified" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};



// Joi schema for the API request
const verifyOTPSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required()
});

const verifyOTPAndSetActivate = async (req, res) => {
    const { email, otp } = req.body;

    // Validate the input data
    const { error } = verifyOTPSchema.validate({ email, otp });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isOTPValid = await bcrypt.compare(otp.toString(), user.verification.otp);
        const isExpired = new Date() > new Date(user.verification.expiresAt);

        if (isOTPValid && !isExpired) {
            // Mark user as verified
            //await User.updateOne({ email }, { $set: { verified: true } });
            user.statusActive = true;
            await user.save();
            res.status(200).json({ message: "OTP verified successfully" });
        } else {
            res.status(400).json({ message: "Invalid or expired OTP" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};



const activateDeactivateUser = async (req, res) => {
    const { email, activate } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's statusActive based on the 'activate' parameter
        user.statusActive = activate;
        await user.save();

        const action = activate ? 'activated' : 'deactivated';
        res.status(200).json({ message: `User ${action} successfully`, user: user });
    } catch (error) {
        console.error('Activate/Deactivate User Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


// Export the function
//module.exports = sendOTPAndActivate;



// const signin = async (req, res) => {
//     // Implement the signin logic
//     const {email ,password} = req.body;
    
//     try{

//         const existingUser = await userModel.findOne({email: email});
//         if(!existingUser){
//             res.status(404).json({message:"User does not exist"});
//         }

//         const matchpassword = await bcrypt.compare(password,existingUser.password)

//         if(!matchpassword){
//             res.status(400).json({message: "Invalid Credential"});
//         }

//         const token = jwt.sign({email: existingUser.email , id: existingUser._id} , SECRET_KEY);
//         res.status(201).json({user: existingUser , token: token});

//     }catch(error){
//         console.log(error);
//         res.status(500).json({message: "Something Went wrong"});
//     }
// }
/*
const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate and send the JWT token
        const token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, SECRET_KEY);
        res.status(200).json({ userId: existingUser._id, token: token });
    } catch (error) {
        console.error('Signin Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
*/
/*

const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate and send the JWT token
        const token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, SECRET_KEY);

        // Return user profile data along with the token
        const userProfileData = {
            userId: existingUser._id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
            profileImage: existingUser.profileImage,
            bio: existingUser.bio,
            contactNumber: existingUser.contactNumber,
            address: existingUser.address,
            verified: existingUser.verified,
            statusActive: existingUser.statusActive,
            role: existingUser.role
        };

        res.status(200).json({ token: token, user: userProfileData });
    } catch (error) {
        console.error('Signin Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
*/
/*
const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "Emailnotexist" });
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Passwordwrong" });
        }

        if (!existingUser.verified) {
            // User email is not verified, send OTP
            const otp = generateOTP();
            const hashedOTP = await bcrypt.hash(otp.toString(), 10);

            // Update user data with OTP
            await User.updateOne({ email }, {
                $set: {
                    verification: {
                        otp: hashedOTP,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiration
                    }
                }
            });

            // Send OTP via email
            await sendOTP(email, otp);

            return res.status(401).json({ message: "OTPsent" });
        }

        if (!existingUser.statusActive) {
            return res.status(403).json({ message: "Accountblocked" });
        }

        // Generate and send the JWT token
        const token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, SECRET_KEY);

        // Return user profile data along with the token
        const userProfileData = {
            userId: existingUser._id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
            profileImage: existingUser.profileImage,
            bio: existingUser.bio,
            contactNumber: existingUser.contactNumber,
            address: existingUser.address,
            verified: existingUser.verified,
            statusActive: existingUser.statusActive,
            role: existingUser.role
        };

        res.status(200).json({ token: token, user: userProfileData });
    } catch (error) {
        console.error('Signin Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

*/


const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "Emailnotexist" });
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Passwordwrong" });
        }

        if (!existingUser.verified) {
            // User email is not verified, send message instead of OTP
            return res.status(401).json({ message: "Adminnotverified" });
        }

        if (!existingUser.statusActive) {
            const otp = generateOTP();
            const hashedOTP = await bcrypt.hash(otp.toString(), 10);

            // Update user data with OTP
            await User.updateOne({ email }, {
                $set: {
                    verification: {
                        otp: hashedOTP,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiration
                    }
                }
            });

            // Send OTP via email
            await sendOTP(email, otp);

            return res.status(401).json({ message: "OTPsent" });
        }

        // If user is verified and active, generate and send the JWT token
        const token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, SECRET_KEY);

        // Return user profile data along with the token
        const userProfileData = {
            userId: existingUser._id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
            profileImage: existingUser.profileImage,
            bio: existingUser.bio,
            contactNumber: existingUser.contactNumber,
            address: existingUser.address,
            verified: existingUser.verified,
            statusActive: existingUser.statusActive,
            role: existingUser.role
        };

        res.status(200).json({ token: token, user: userProfileData });
    } catch (error) {
        console.error('Signin Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};



// Reset Password Request API
const resetPasswordRequest = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is verified
        if (!existingUser.verified) {
            return res.status(401).json({ message: "User is not verified" });
        }

        // Generate OTP
        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp.toString(), 10);

        // Update user data with OTP
        await User.updateOne({ email }, {
            $set: {
                resetPassword: {
                    otp: hashedOTP,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiration
                }
            }
        });

        // Send OTP via email
        await sendOTP(email, otp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error('Reset Password Request Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Verify OTP and Set New Password API
const matchOTPsetNewPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isOTPValid = await bcrypt.compare(otp.toString(), user.verification.otp);
        const isExpired = new Date() > new Date(user.verification.expiresAt);


        if (isOTPValid && !isExpired) {
            // Update user's password with the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;


            // Save the updated user
            await user.save();

            return res.status(200).json({ message: "Password reset successfully" });
        } else {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};




const updateProfile = async (req, res) => {
    const userId = req.userId;
    const { firstName, lastName, bio, contactNumber, address } = req.body;

    try {
        // Check if a profile image was uploaded
        const profileImage = req.fileUrl ? req.fileUrl : undefined;

        // Your logic to validate user data (excluding email and password)
        const { error } = validateUpdateUser({ firstName, lastName, bio, contactNumber, address });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const currentUser = await User.findById(userId);
        const currentProfileImage = currentUser.profileImage;

        // Your logic to update the user profile (excluding email and password)
        const updatedFields = {
            firstName,
            lastName,
            bio,
            contactNumber,
            address,
        };

        // If a profile image was uploaded, add it to the updated fields
        if (profileImage) {
            updatedFields.profileImage = profileImage;

            if (currentProfileImage) {
               
                const filePath = path.resolve(__dirname, '..',  currentProfileImage);
                if (fs.existsSync(filePath)) {
                    // Delete the file
                    fs.unlinkSync(filePath);
                } else {
                    console.error(`File not found: ${filePath}`);
                }
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


/*
const updateProfile = async (req, res) => {
    const userId = req.userId;
    const { firstName, lastName, bio, contactNumber, address } = req.body;

    try {
        // Check if a profile image was uploaded
        const profileImage = req.fileUrl ? req.fileUrl : undefined;

        // Your logic to validate user data (excluding email and password)
        const { error } = validateUpdateUser({ firstName, lastName, bio, contactNumber, address });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Get the user's current profile image URL from the database
        const currentUser = await User.findById(userId);
        const currentProfileImage = currentUser.profileImage;

        // Your logic to update the user profile (excluding email and password)
        const updatedFields = {
            firstName,
            lastName,
            bio,
            contactNumber,
            address,
        };

        // If a profile image was uploaded, add it to the updated fields
      /*  if (profileImage) {
            updatedFields.profileImage = profileImage;
            
            // Delete the previous profile image if it exists
            if (currentProfileImage) {
                fs.unlinkSync(path.join(__dirname, currentProfileImage));
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
*/

const getProfileImage = async (req, res) => {
    const userId = req.userId;

    try {
        // Fetch the user to get the profile image filename
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user has a profile image
        if (!user.profileImage) {
            return res.status(404).json({ message: "Profile image not found" });
        }

        // Construct the URL of the profile image based on the filename
        const profileImageUrl = `${user.profileImage}`;

        // Send the profile image URL in the response body
        res.status(200).json({ profileImageUrl });
    } catch (error) {
        console.error('Get Profile Image Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

/*
const getProfileImage = async (req, res) => {
    const userId = req.userId;

    try {
        // Fetch the user to get the profile image path
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user has a profile image
        if (!user.profileImage) {
            return res.status(404).json({ message: "Profile image not found" });
        }

        // Read the profile image file as a Base64-encoded string
        const imageBuffer = await fs.readFile(user.profileImage);
        const base64Image = imageBuffer.toString("base64");

        // Send the Base64-encoded image in the response body
        res.status(200).json({ profileImage: base64Image });
    } catch (error) {
        console.error('Get Profile Image Error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

*/
module.exports = { signup, signin ,siginbyjwt , getUsersForAdmin,updateProfile ,getProfileImage , sendOTPAndVerified , verifyOTPAndSetActivate , activateDeactivateUser , resetPasswordRequest ,matchOTPsetNewPassword};