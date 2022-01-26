const Item = require("../models/item");
const Brand = require("../models/brand");
const Category = require("../models/category");
const async = require("async");
const { body, validationResult } = require("express-validator");
const cloudinary = require("../cloudinary");

//Display all categories

exports.item_get = function (req, res, next) {
  Item.find()
    .sort({ name: "asc" })
    .populate("brand")
    .populate("category")
    .exec(function (err, list_items) {
      if (err) return next(err);
      //Successfull so render list of items

      res.render("item_list", { title: "Items", items: list_items });
    });
};

//Display all items of one item
exports.item_detail = function (req, res, next) {
  Item.findById(req.params.id)
    .populate("brand")
    .populate("category")
    .exec(function (err, item) {
      if (err) return next(err);
      if (item === null) {
        const err = new Error("No item found");
        return next(err);
      }
      //Successful so render item details!
      res.render("item_detail", { title: item.name, item: item });
    });
};

//Display item create form on GET
exports.item_create_get = function (req, res, next) {
  async.parallel(
    {
      brands: function (cb) {
        Brand.find().sort({ name: "asc" }).exec(cb);
      },
      categories: function (cb) {
        Category.find().sort({ name: "asc" }).exec(cb);
      },
    },
    function (err, results) {
      if (err) return next(err);
      //no err render form
      res.render("item_form", {
        title: "Create Item",
        brands: results.brands,
        categories: results.categories,
      });
    }
  );
};

//Handle item create on post
exports.item_create_post = [
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === undefined) {
        req.body.category = [];
      } else {
        req.body.category = new Array(req.body.category);
      }
    }
    next();
  },
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Item name must be specified")
    .isAlphanumeric("en-US", { ignore: " " })
    .withMessage("Item name cannot contain non-alphanumeric character")
    .escape(),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Price must be specified")
    .isNumeric("en-US", { ignore: " " })
    .withMessage("Price must be a number")
    .escape(),
  body("qty")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Quantity must be specified")
    .isNumeric("en-US", { ignore: " " })
    .withMessage("Quantity must be a number")
    .escape(),
  body("desc")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Description must be specified (min 3 characters)!")
    .escape(),
  body("category.*").escape(),

  //Process the request after validation

  (req, res, next) => {
    //Extract Errors

    const errors = validationResult(req);
    if (req.fileValidationError) {
      errors.imgInvalid = req.fileValidationError;
    }

    if (!errors.isEmpty()) {
      //Render form page with errors/values
      async.parallel(
        {
          brands: function (cb) {
            Brand.find().sort({ name: "asc" }).exec(cb);
          },
          categories: function (cb) {
            Category.find().sort({ name: "asc" }).exec(cb);
          },
        },
        function (err, results) {
          if (err) return next(err);
          let nameErr, priceErr, qtyErr, descErr;
          if (errors) {
            for (let err of errors.array()) {
              switch (err.param) {
                case "desc":
                  descErr = err.msg;
                  break;
                case "name":
                  nameErr = err.msg;
                  break;
                case "price":
                  priceErr = err.msg;
                  break;
                case "qty":
                  qtyErr = err.msg;
                  break;
              }
            }
          }
          res.render("item_form", {
            title: "Create Item",
            nameErr: nameErr,
            priceErr: priceErr,
            descErr: descErr,
            qtyErr: qtyErr,
            categories: results.categories,
            brands: results.brands,
            imgValid: errors.imgInvalid,
            errors: errors.array(),
            name: req.body.name,
            price: req.body.price,
            qty: req.body.qty,
            desc: req.body.desc,
            selectedCat: req.body.category,
            selected_brand: req.body.brand,
          });
        }
      );
    } else {
      //Data is valid
      //Check if item is already exist
      Item.findOne({ name: req.body.name }).exec(async function (
        err,
        found_item
      ) {
        if (err) return next(err);
        //if already exist
        if (found_item) {
          res.redirect(found_item.url);
        } else {
          let result =
            req.file === undefined
              ? ""
              : await cloudinary.uploader.upload(req.file.path);

          const item = new Item({
            name: req.body.name,
            brand: req.body.brand,
            price: req.body.price,
            qty: req.body.qty,
            desc: req.body.desc,
            category: [...req.body.category],
            imgURL: result === "" ? "" : result.url,
          });
          item.save(function (err) {
            if (err) return next(err);
            //item saved, redirect
            res.redirect(item.url);
          });
        }
      });
    }
  },
];

//Display item update form on GET
exports.item_update_get = function (req, res, next) {
  async.parallel(
    {
      brands: function (cb) {
        Brand.find().sort({ name: "asc" }).exec(cb);
      },
      categories: function (cb) {
        Category.find().sort({ name: "asc" }).exec(cb);
      },
      item: function (cb) {
        Item.findById(req.params.id).exec(cb);
      },
    },
    function (err, results) {
      if (err) return next(err);

      if (results.item == null) {
        // No results.
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      res.render("item_form", {
        title: "Update Item",
        categories: results.categories,
        brands: results.brands,
        name: results.item.name,
        price: results.item.price,
        qty: results.item.qty,
        desc: results.item.desc,
        selectedCat: results.item.category,
        selected_brand: results.item.brand,
      });
    }
  );
};

//Handle item update form on POST
exports.item_update_post = [
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === undefined) {
        req.body.category = [];
      } else {
        req.body.category = new Array(req.body.category);
      }
    }
    next();
  },
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Item name must be specified")
    .isAlphanumeric("en-US", { ignore: " " })
    .withMessage("Item name cannot contain non-alphanumeric character")
    .escape(),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Price must be specified")
    .isNumeric("en-US", { ignore: " " })
    .withMessage("Price must be a number")
    .escape(),
  body("qty")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Quantity must be specified")
    .isNumeric("en-US", { ignore: " " })
    .withMessage("Quantity must be a number")
    .escape(),
  body("desc")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Description must be specified (min 3 characters)!")
    .escape(),
  body("category.*").escape(),

  //Process the request after validation

  (req, res, next) => {
    async.parallel(
      {
        brands: function (cb) {
          Brand.find().sort({ name: "asc" }).exec(cb);
        },
        categories: function (cb) {
          Category.find().sort({ name: "asc" }).exec(cb);
        },
        item: function (cb) {
          Item.findById(req.params.id).exec(cb);
        },
      },
      async function (err, results) {
        if (err) return next(err);

        //let imgURL=results.item.imgURL;
        const errors = validationResult(req);
        if (req.fileValidationError) {
          errors.imgInvalid = req.fileValidationError;
        }
        if (!errors.isEmpty()) {
          let nameErr, priceErr, qtyErr, descErr;
          for (let err of errors.array()) {
            switch (err.param) {
              case "desc":
                descErr = err.msg;
                break;
              case "name":
                nameErr = err.msg;
                break;
              case "price":
                priceErr = err.msg;
                break;
              case "qty":
                qtyErr = err.msg;
                break;
            }
          }
          res.render("item_form", {
            title: "Update Item",
            nameErr: nameErr,
            priceErr: priceErr,
            descErr: descErr,
            qtyErr: qtyErr,
            categories: results.categories,
            brands: results.brands,
            imgValid: errors.imgInvalid,
            errors: errors.array(),
            name: req.body.name,
            price: req.body.price,
            qty: req.body.qty,
            desc: req.body.desc,
            selectedCat: req.body.category,
            selected_brand: req.body.brand,
          });
        } else {
          let imgURL;
          let result;
          if (results.item.imgURL !== "" && req.file === undefined) {
            imgURL = results.item.imgURL;
          } else {
            result = await cloudinary.uploader.upload(req.file.path);
            imgURL = result.url;
          }
          const item = new Item({
            name: req.body.name,
            brand: req.body.brand,
            price: req.body.price,
            qty: req.body.qty,
            desc: req.body.desc,
            category: [...req.body.category],
            imgURL: imgURL,
            _id: req.params.id,
          });
          Item.findByIdAndUpdate(req.params.id, item, function (err, theitem) {
            if (err) return next(err);
            //sucess so redirect to updated item
            res.redirect(theitem.url);
          });
        }
      }
    );
  },
];

//handle item DELETE form on GET
exports.item_delete_get = function (req, res, next) {
  res.send("Not implemented yet");
};

//hande item DELETE form on POST
exports.item_delete_post = function (req, res, next) {
  res.send("Not implemented yet");
};
