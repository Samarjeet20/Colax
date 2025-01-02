const mongoose = require("mongoose")
const validator = require("validator");


const userSchema = new mongoose.Schema({
    name: {
       type: String,
       required: true,
       trim: true,
       lowercase: true
     },
    email: {
       type: String,
       required: true,
       unique: true,
       lowercase: true,
        validate( value ) {
            if( !validator.isEmail( value )) {
                throw new Error( "Email is invalid" )
            }
        }
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    status: {
        type:String,
        default:'active',
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        trim: true,
        validate(value) {
           if( value.toLowerCase().includes("password")) {
           throw new Error("password musnt contain password")
          }
       }
    },
    verified: {
        type: Boolean,
    },
  
    }, {
        timestamps: true
    }
);

const User = mongoose.model("user", userSchema);             //model created

module.exports =  User;