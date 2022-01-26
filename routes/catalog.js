var express = require('express');
var router = express.Router();
const multer=require('../multer');
var cors=require('cors');

//Require controller modules

const category_controller=require('../controllers/categoryController');
const brand_controller=require('../controllers/brandController');
const item_controller=require('../controllers/itemController');

/// CATEGORY ROUTES ///

//GET request for catalog HOME
router.get('/',(req,res,next)=>{
    res.render('home',{title:'Inventory Catalog'});
});

//GET request for list of all categories
router.get('/categories',category_controller.category_get);

//GET request for creating a category
router.get('/category/create',category_controller.category_create_get);

//POST request for creating a category
router.post('/category/create',multer.single('image'),category_controller.category_create_post);

//GEt request for updating a category
router.get('/category/:id/update',category_controller.category_update_get);

//POST request for updating a category
router.post('/category/:id/update',multer.single('image'),category_controller.category_update_post);

//GET request for deleting a category
router.get('/category/:id/delete',category_controller.category_delete_get);

//POST request for updating a category
router.post('/category/:id/delete',category_controller.category_delete_post);

//GET request for one category
router.get('/category/:id',category_controller.category_detail);

/// BRAND ROUTES ////

//GET request for list of all categories
router.get('/brands',brand_controller.brand_get);

//GET request for creating a brand
router.get('/brand/create',brand_controller.brand_create_get);

//POST request for creating a brand
router.post('/brand/create',multer.single('image'),brand_controller.brand_create_post);

//GEt request for updating a brand
router.get('/brand/:id/update',brand_controller.brand_update_get);

//POST request for updating a brand
router.post('/brand/:id/update',multer.single('image'),brand_controller.brand_update_post);

//GET request for deleting a brand
router.get('/brand/:id/delete',brand_controller.brand_delete_get);

//POST request for updating a brand
router.post('/brand/:id/delete',brand_controller.brand_delete_post);

//GET request for one brand
router.get('/brand/:id',brand_controller.brand_detail);


/// ITEMS ROUTES ///

//GET request for list of all categories
router.get('/items',item_controller.item_get);

//GET request for creating a item
router.get('/item/create',item_controller.item_create_get);

//POST request for creating a item
router.post('/item/create',multer.single('image'),item_controller.item_create_post);

//GEt request for updating a item
router.get('/item/:id/update',multer.single('image'),item_controller.item_update_get);

//POST request for updating a item
router.post('/item/:id/update',multer.single('image'),item_controller.item_update_post);

//GET request for deleting a item
router.get('/item/:id/delete',item_controller.item_delete_get);

//POST request for updating a item
router.post('/item/:id/delete',item_controller.item_delete_post);

//GET request for one item
router.get('/item/:id',item_controller.item_detail);

module.exports=router;

