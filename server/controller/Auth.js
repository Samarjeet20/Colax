const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")                                   //Documentation for json web token JWT
const authMiddlewares = require('../middlewares/authMiddleware');

//env variables
require("dotenv").config();
const PORT = process.env.PORT;

//mongodb User model
const User = require("../models/user");
//mongodb User Verification model
const UserVerification = require("../models/userVerification");
//mongodb password reset model 
const PasswordReset = require("../models/passwordReset");           

//mail handeler
const nodemailer = require("nodemailer");

//unique string
const {v4: uuidv4} = require("uuid");

//nodemailer stuff
let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_APP_PASS,
    }
})

//testing success
transporter.verify((error, success) => {
    if(error){
        console.log(error);
    }else{
        console.log("Ready for Messages!");
        console.log(success);
    }
})

//send verification email
const sendVerificationEmail = async ({_id, email}, res) => {
    //url to be used in the email
    const currentUrl = `http://localhost:${PORT}/`;
    
    const uniqueString = uuidv4() + _id;
    const verificationUrl = `${currentUrl}user/verify/${_id}/${encodeURIComponent(uniqueString)}`;
    console.log(`Verification URL: ${verificationUrl}`);   // Log the URL
    //mail options
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        // html: `<p>Verify your Email address to complete the signup and login process.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href="${currentUrl + "user/verify/" + _id + "/" + uniqueString}">here</a> to proceed.</p>`,
        html: `<p>Verify your Email address to complete the signup and login process.</p>
               <p>This link <b>expires in 6 hours</b>.</p>
               <p>Press <a href="${verificationUrl}">here</a> to proceed.</p>`,
    };
    //hash the unique string
    const saltRounds = 10;
    try {
        console.log("Hashing unique string...");   //remove
        const hashedUniqueString = await bcrypt.hash(uniqueString, saltRounds);
        console.log("Saving new verification record...");    //remove
        //set values in UserVerification collection
        const newVerification = new UserVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000               //6hrs in milli seconds
        });

        await newVerification.save();
        console.log('Sending verification email...');
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent.');
        return res.status(200).json({
            status: "PENDING",
            message: "Verification email sent!",
        });

    } catch (error) {
        console.log(error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: "An error occurred while sending verification email!",
            });
        }
    }
}

//signup route handler
async function handleUserSignup(req, res){
    try{
        // get data
        let {name,email,password} = req.body;
        //then we trim the entries for better comparison
        name = name.trim();
        email = email.trim();
        password = password.trim();
        //check if all fields are filled
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message: "Fill all the details!",
            });
        }
        //check if user already exist
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                sucess: false,
                message: "user already Exists",
            });
        }
        // secure password
        let hashedPassword;                                            //Documentation for hash(bcrypt-npm)
        const saltRounds = 10;
        try{
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }
        catch(err){
            return res.status(500).json({                             // We can also use Retry strategy
                success: false,
                message: 'Error in Hashing Password'
            })
        }
        //create entry for User
        const user = await User.create({
            name,
            email,
            password:hashedPassword, 
            verified: false,
        })
        //handle account verification
        const result = await user.save();
        await sendVerificationEmail(result, res);
        // return res.status(200).json({
        //     success: true,
        //     message: "User created successfully",
        // });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            sucess: false,
            message: "User cannot be registered,please try again later"
        });

    }
};

//verify Email
async function handleUserEmailVerification(req, res) {
    let { userId, uniqueString } = req.params;

    try {
        const userVerificationRecords = await UserVerification.find({ userId });
        if (userVerificationRecords.length === 0) {
            // const error =  "Account record doesn't exist or has been verified already. Please signup or login.";
            // const message = "Account record doesn't exist or has been verified already. Please signup or login.";
            // return res.redirect(`/user/verified/error=true&message=${message}`);
            // return res.redirect('/user/verified', {
            //     message: "Account record doesn't exist or has been verified already. Please signup or login.",
            // });
            // return res.render("unverified", {
            //     error: "Account record doesn't exist or has been verified already. Please signup or login.",
            //     message: "Account record doesn't exist or has been verified already. Please signup or login.",
            // });
            return res.redirect('/user/verified?message=' + encodeURIComponent("Account record doesn't exist or has been verified already. Please signup or login."));
        }

        const { expiresAt, uniqueString: hashedUniqueString } = userVerificationRecords[0];

        if (expiresAt < Date.now()) {
            await UserVerification.deleteOne({ userId });
            await User.deleteOne({ _id: userId });
            // const error = "Link has expired. Please signup again!";
            // const message = "Link has expired. Please signup again!";
            // return res.redirect(`/user/verified/error=true&message=${message}`);
            // return res.redirect('/user/verified', {
            //     message: "Link has expired. Please signup again!",
            // });
            // return res.render("unverified", {
            //     error: "Link has expired. Please signup again!",
            //     message: "Link has expired. Please signup again!",
            // });
            return res.redirect('/user/verified?message=' + encodeURIComponent("Link has expired. Please signup again!"));
        }

        const match = await bcrypt.compare(uniqueString, hashedUniqueString);
        if (!match) {
            // const error = "Invalid verification details passed. Check your inbox!";
            // const message = "Invalid verification details passed. Check your inbox!";
            // return res.redirect(`/user/verified/error=true&message=${message}`);
            // return res.redirect('/user/verified', {
            //     message: "Invalid verification details passed. Check your inbox!",
            // });
            // return res.render("unverified", {
            //     error: "Invalid verification details passed. Check your inbox!",
            //     message: "Invalid verification details passed. Check your inbox!",
            // });
            return res.redirect('/user/verified?message=' + encodeURIComponent("Invalid verification details passed. Check your inbox!"));
        }

        await User.updateOne({ _id: userId }, { verified: true });
        await UserVerification.deleteOne({ userId });
        // return res.redirect('/user/verified');
        return res.redirect('/user/verified?message=' + encodeURIComponent("Your account has been successfully verified."));
        
    } catch (error) {
        console.log(error);
        // const err = "An error occurred while checking for existing user verification record.";
        // const message = "An error occurred while checking for existing user verification record.";
        // return res.redirect(`/user/verified/error=true&message=${message}`);
        // return res.redirect('/user/verified', {
        //     message: "An error occurred while checking for existing user verification record.",
        // });
        // return res.render("unverified", {
        //     error: "An error occurred while checking for existing user verification record.",
        //     message: "An error occurred while checking for existing user verification record.",
        // });
        return res.redirect('/user/verified?message=' + encodeURIComponent("An error occurred while checking for existing user verification record."));
    }
}


//handle verified user
async function handleVerifiedUser(req, res){
    try {
        // Handle verification logic
        return res.render("verified", {
            message: req.query.message,
        })
        
    } catch (error) {
        console.error(error);
        // Handle errors
        return res.redirect('/user/verified?message=An%20error%20occurred%20while%20verifying%20your%20account.');
    }
}

//login route handler
async function handleUserLogin(req, res){
    try{
        //get data
        let {email,password} = req.body;
        //then we trim the entries for better comparison
        email = email.trim();
        password = password.trim();
        //validation on email and password
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please fill all the details correctlly"
            })
        }

        //check for registered user
        let user = await User.findOne({email});
        //if not a registered user
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User is not registered",
            });
        }

        // if user is block by admin 
        if(user.status !== "active"){
            throw new Error("User's account is blocked, please contact to administrator");
        }

        const payload = {
            email: user.email,
            id: user._id,
           // role:user.role,
        }

        //verify password and generate a jwt token
        if(await bcrypt.compare(password,user.password)){
                    //password match
                    let token=jwt.sign(payload,
                                        process.env.JWT_SECRET,
                                        {
                                            expiresIn:"2h",
                                        });
                user = user.toObject();
                user.token = token;
                user.password = undefined;                                        //we removed password from user object and not from DB as we dont want to send it in token as hacker might get it
                const options = {
                    expires: new Date(Date.now()+3*24*60*60*1000),              //here we created options for cookie
                    httpOnly: true,
                }
                //Now we want to create cookie
                res.cookie('token',token,options).status(200).json({           //("cookie name",token,options)
                    success: true,
                    token,
                    user,
                    message: "User logged in successfully"
                });
        }
        else{
            //password does not match
            return res.status(403).json({
                success: false,
                message: "Incorrect Password"
            });

        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login failure"
        })
 
    }
};

// get current user 
const handlegetUserProfile = (authMiddlewares, async (req,res)=>{
    try{
       const user = await UserModel.findById(req.body.userId);
       res.send({
         success: true,
         message: "user fetched successfully",
         data:user,
       })
    }catch(error){
        res.send({
            success:false,
            message:error.message,
        })
    }
})

const handlegetUsers = (authMiddlewares, async (req,res)=>{
    try {
        const users = await UserModel.find();
        res.send({
            success:true,
            message:"user fetch succesfully",
            data:users
        })
    } catch (error) {
        res.send({
            success:false,
            message:error.message,
        })
    }
})

//update user
const handleUpdateUser = (authMiddlewares,async (req,res)=>{
    try {
        await UserModel.findByIdAndUpdate(req.params.id,req.body);
        res.send({
            success: true,
            message:'User status updated successfully'
        })
    } catch (error) {
        res.send({
            success:false,
            message:error.message,
        })
    }
})

//Actually reset the password
async function handlePasswordReset(req, res){
    // let {userId, resetString, newPassword} = req.body;
    let {email, redirectUrl} = req.body;

    //find the email in our User Database
    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({
            sucess: false,
            message: "No such user with the given Email!",
        });
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleUserEmailVerification,
    handleVerifiedUser,
    handlegetUserProfile,
    handlegetUsers,
    handleUpdateUser,
    handlePasswordReset,
};