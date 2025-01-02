const express = require("express");
const authMiddlewares = require('../middlewares/authMiddleware');

//mongodb User model
const User = require("../models/user");

//mongodb Product model
const Product = require("../models/product");

//mongodb Notification model
const Notification = require("../models/notification");

//save notification handler
const handleSaveNotification = (authmiddleware,async (req,res)=>{
    try {
       const newNotification = new NotificationModel(req.body);
       await newNotification.save();
       res.send({
          success: false,
          message: "Notification added successfully",
      });
    } catch (error) {
      res.send({
          success: false,
          message: error.message,
      })
    }
});

//Get all notifications
const handleGetAllNotifications = (authmiddleware,async (req,res)=>{
  try {
      const notifications = await NotificationModel.find({
          user:req.body.userId,
      }).sort({
          createdAt:-1
      });
      res.send({
          success:true,
          data:notifications
      })
  } catch (error) {
      res.send({
          success: false,
          message:error.message,
      })

  }
})

//Delete notification by id
const handleDeleteNotifById = (authmiddleware ,async (req,res)=>{
   try {
       await NotificationModel.findByIdAndDelete(req.params.id);
       res.send({
          success: true,
          message: 'Notification Deleted Successfully',
       })
   } catch (error) {
      res.send({
          success: false,
          message: error.message,
      })
   }
})

// read all notification by users
const handleReadAllNotif = (authmiddleware,async (req,res)=>{
  try {
      await NotificationModel.updateMany(
          {user:req.body.userId, read:false},{$set: {read:true}}
          )
          res.send({
              success:true,
              message:"read all notifications successfully",
          })
  } catch (error) {
      res.send({
          success:false,
          message:error.message,
      })
  }
})

module.exports = {
    handleSaveNotification,
    handleGetAllNotifications,
    handleDeleteNotifById,
    handleReadAllNotif,
};