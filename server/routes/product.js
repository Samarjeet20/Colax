const express = require("express");
const { handleAddProduct, handleGetAllProducts, handleGetProductByKey, handleGetProductById, handleEditProductById, handleDeleteProductById, handleUpdateProductStatusByAdmin} = require("../controller/product");

const router = express.Router();

//Post request for adding new product
router.post('/add-products', handleAddProduct);

//Post request for getting all products
router.post('/get-products', handleGetAllProducts);

//Get request for product using key
router.get('/search/:key', handleGetProductByKey);

//Get request for product using id
router.get('/get-product-by-id/:id', handleGetProductById);

//Put request to edit product
router.put('/edit-products/:id', handleEditProductById);

//Delete product request by id
router.deleteall('/delete-products/:id', handleDeleteProductById);

//Put (Update) status request by admin
router.put('/update-product-status/:id', handleUpdateProductStatusByAdmin);

module.exports = router;