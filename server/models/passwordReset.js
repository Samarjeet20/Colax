const mongoose = require("mongoose")
const validator = require("validator");


const passwordResetSchema = new mongoose.Schema({
    userId: String,
    resetString: String,
    createdAt: Date,
    expiresAt: Date,
  
    }, {
        timestamps: true
    }
);

const PasswordReset = mongoose.model("passwordreset", passwordResetSchema);             //model created

module.exports =  PasswordReset;