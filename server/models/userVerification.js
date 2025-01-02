const mongoose = require("mongoose")
const validator = require("validator");


const userVerificationSchema = new mongoose.Schema({
    userId: String,
    uniqueString: String,
    createdAt: Date,
    expiresAt: Date,
  
    }, {
        timestamps: true
    }
);

const UserVerification = mongoose.model("userverification", userVerificationSchema);             //model created

module.exports =  UserVerification;