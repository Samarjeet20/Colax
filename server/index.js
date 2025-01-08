const express = require("express");

const path = require("path"); //used to tell path of views

//Env variables
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

//Setting ejs engine
app.set("view engine", "ejs"); //we needd to tell which engine we are going to use
app.set("views", path.resolve("./views")); //this tells where our ejs files are

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//importing routes
const userRoute = require("./routes/user");
const  productRoute = require("./routes/product");

//connecting database
const dbConnect = require("./config/database");
dbConnect();

//Route handeling(route import and mount)
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);


//port listening
app.listen(PORT, () => {
  console.log(`Server Started at Port ${PORT}`);
});