const express = require("express");
const { handleSaveNotification, handleGetAllNotifications, handleDeleteNotifById, handleReadAllNotif } = require("../controller/notification");

const router = express.Router();

//Post request to save notification
router.post('/notify',handleSaveNotification);

//Get request for all notifications
router.get('/get-all-notifications', handleGetAllNotifications);

//Delete request by id
router.delete('/delete-notification/:id', handleDeleteNotifById);

//Put request (Just to read all notifications)
router.put('/read-all-notifications', handleReadAllNotif);

module.exports = router;