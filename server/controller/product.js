const express = require("express");
const multer = require("multer");
const authMiddlewares = require('../middlewares/authMiddleware');

//env variables
require("dotenv").config();

//mongodb User model
const User = require("../models/user");

//mongodb Product model
const Product = require("../models/product");

//mongodb Notification model
const Notification = require("../models/notification");

//add new product handler
const handleAddProduct = (authMiddlewares,async(req,res)=>{
    try {
       const newProduct = new Product(req.body);
       await newProduct.save();

       // console.log(req.body.userId)
       // get user by id
       const username = await User.findById(req.body.userId);
       // console.log(username.name);
       // send notification to admin
       // 1 get all admins 
       const admins = await User.find({role:'admin'});
       admins.forEach( async(admin) => {
           const newNotification = new Notification({
               user: admin._id,
               title:"New product added",
               message:`New Product Added by ${username.name}`,
               onClick:'/admin',
               read:false,
           })
           await newNotification.save();
       })
       res.send({
           success:true,
           message:"product add successfully"
       })
       
    } catch (error) {
       res.send({
           success:false,
           message:error.message
       })
    }
});


// get all  products
async function handleGetAllProducts(req,res){
    try {
        const {seller, category=[], age=[], status}=req.body;
        let filters={};
        if(seller){
            filters.seller=seller;
        }
        if(status){
            filters.status=status;
        }

        // filters by category
        if(category.length > 0){
            filters.category={$in: category}
        }


        if(age.length > 0){
            age.forEach((item)=>{
                const fronteAge = item.split("-")[0];
                // console.log(fronteAge);
                const toAge = item.split("-")[1];
                // console.log(toAge);
                    filters.age={$gte: Number(fronteAge), $lte:Number(toAge)};
            })
        }
        const products= await ProductModel.find(filters).populate("seller").sort({createdAt:-1});
        res.send({
            success:true,
            data:products,
        })
    } catch (error) {
         res.send({
            success:false,
            message:error.message,
         })

    }
}


// get products by search
async function handleGetProductByKey(req,res){
    try {
         const response=await ProductModel.find({
            '$or':[
                {name:{$regex:req.params.key}},
            ]
         });
         res.send({
            success:true,
            data:response,
        })
    } catch (error) {
        res.send({
            success:false,
            message:error.message,
        })
    }
}


// get-products-by-id
const handleGetProductById = (authMiddlewares, async(req,res)=>{
    try {
        const product  = await ProductModel.findById(req.params.id).populate('seller');
        res.send({
            success: true,
            data:product
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }
})


// edit product
const handleEditProductById = (authMiddlewares,async(req,res)=>{
    try {
        await ProductModel.findByIdAndUpdate(req.params.id,req.body);
        res.send({
            success:true,
            message: 'Product updated successfully',
        })
    } catch (error) {
        res.send({
            success: true,
            message: error.message,
        })
    }
})


// delete a product by id
const handleDeleteProductById = ( authMiddlewares , async(req,res)=>{
    try {
        await ProductModel.findByIdAndDelete(req.params.id);
        res.send({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        res.send({
            success: true,
            message: error.message
        })
    }
})


// // get image from pc
// const storage = multer.diskStorage({
//     filename: function (req,file,callback){
//         callback(null, Date.now() +file.originalname);
//     }
// });


// router.post('/upload-product-image',authMiddlewares,multer({storage: storage}).single('file'), async(req,res)=>{
//     try {
//         // upload image to cloudinary
//         const result = await cloudinary.uploader.upload(req.file.path,{
//             folder:'sheymp',
//         });
        
//         const productId = req.body.productId;
//         await ProductModel.findByIdAndUpdate(productId,{
//             $push:{images:result.secure_url},
//         });
//         res.send({
//             success:true,
//             message:'Image uploaded successfully',
//             data:result.secure_url,
//         })
//     } catch (error) {
//         res.send({
//             success:false,
//             message:error.message,
//         })
//     }
// })


// update products status by admin
const handleUpdateProductStatusByAdmin = (authMiddlewares,async(req,res)=>{
    try {
        const {status} = req.body;
       const updatedProduct= await ProductModel.findByIdAndUpdate(req.params.id,{status});

        // send notification to seeller after admin acceepts the product
        const notification  = new notificationModel({
            user:updatedProduct.seller,
            title:'product status updated',
            message:`your product ${updatedProduct.name} has been ${status}`,
            onClick:'/profile',
            read:false,
        })
        await notification.save()
        res.send({
            success:true,
            message:"products status updated successfully"
        })
    } catch (error) {
        res.send({
            success:false,
            message:error.message,
        })
    }
})

module.exports = {
    handleAddProduct,
    handleGetAllProducts,
    handleGetProductByKey,
    handleGetProductById,
    handleEditProductById,
    handleDeleteProductById,
    handleUpdateProductStatusByAdmin,
    
};
