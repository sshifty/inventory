#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Brand = require('./models/brand')
var Item = require('./models/item')



var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var brands = []
var items = []


function categoryCreate(name,imgURL, cb) {
  categorydetail = {name:name , imgURL:imgURL}
 
  
  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}

function brandCreate(name,imgURL, cb) {
  var brand = new Brand({ name: name ,imgURL:imgURL});
       
  brand.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New brand: ' + brand);
    brands.push(brand)
    cb(null, brand);
  }   );
}

function itemCreate(name, category, brand, desc, qty, price, imgURL,cb) {
  itemdetail = { 
    name: name,
    category: category,
    brand: brand,
    desc:desc,
    qty:qty,
    price:price,
    imgURL:imgURL
  }
      
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}




function createCategoriesBrands(cb) {
    async.series([
        function(callback) {
          categoryCreate('Chips','https://res.cloudinary.com/dppzpagiy/image/upload/v1642884613/chips_e4e25n.png', callback);
        },
        function(callback) {
          categoryCreate('Food','https://res.cloudinary.com/dppzpagiy/image/upload/v1642884664/food_u2mo4x.png' ,callback);
        },
        function(callback) {
          categoryCreate('Snacks','https://res.cloudinary.com/dppzpagiy/image/upload/v1642884694/snacks_a7csgk.png' ,callback);
        },
        function(callback) {
          brandCreate('Pringles', 'https://res.cloudinary.com/dppzpagiy/image/upload/v1642885106/pringles_brand_nzbmrp.png',  callback);
        },
        function(callback) {
          brandCreate('Doritos', 'https://res.cloudinary.com/dppzpagiy/image/upload/v1642885101/doritos_r3rdzt.png',  callback);
        }
        
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Nacho Cheese',[categories[0],categories[1],categories[2]], brands[1],'Chees flavoured Nacho',86,2.2,'https://res.cloudinary.com/dppzpagiy/image/upload/v1642884746/nacho_cheese_zih6hu.png',callback);
        },
        function(callback) {
          itemCreate('Original Potato',[categories[0],categories[1],categories[2]],brands[0],'The original Potato Pringles!',32,1.2,'https://res.cloudinary.com/dppzpagiy/image/upload/v1642884767/pringles_gylhjy.png',callback);
        },
        function(callback) {
            itemCreate('Cool Ranch',[categories[0],categories[1],categories[2]],brands[1],'Crunchy Doritos!',65,1,'https://res.cloudinary.com/dppzpagiy/image/upload/v1642885595/cool_ranch_insrpq.png',callback);
        }
        
        ],
        // optional callback
        cb);
}





async.series([
    createCategoriesBrands,
    createItems,
   
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: '+items);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



