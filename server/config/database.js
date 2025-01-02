const mongoose = require("mongoose");

require("dotenv").config();

const dbConnect= ()=>{
    mongoose
        .connect(process.env.MONGODB_URL)
        .then(()=>console.log(" DB Connection sucessful"))
        .catch((error)=>{
            console.log("error in Db connection");
            console.error(error.message);
            process.exit(1);
        });
}

module.exports = dbConnect;