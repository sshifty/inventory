const Brand = require("../models/brand");
const Item = require("../models/item");
const async = require("async");
const cloudinary = require("../cloudinary");
const { body, validationResult } = require("express-validator");

//Display all categories

exports.brand_get = function (req, res, next) {
  Brand.find()
    .sort({ name: "asc" })
    .exec(function (err, list_brands) {
      if (err) return next(err);
      //Sucess so render brand list

      res.render("brand_list", { title: "Brands", brands: list_brands });
    });
};

//Display all items of one brand
exports.brand_detail = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brand_items: function (callback) {
        Item.find({ brand: req.params.id })
          .populate("brand")
          .populate("category")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.brand === null) {
        const err = new Error("No brand found!");
        err.status = 404;
        return next(err);
      }
      //Found brand so render brand items!
      res.render("brand_detail", {
        title: results.brand.name,
        brand_items: results.brand_items,
        brand: results.brand,
      });
    }
  );
};

//Display brand create form on GET
exports.brand_create_get = function (req, res, next) {
  res.render("brand_form", { title: "Create Brand" });
};

//Handle author create on post
exports.brand_create_post = [
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Category name must be specified")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Category name cannot contain non-alphanumeric character")
    .escape(),

  //process the req after validiation/sanitizaion
  (req, res, next) => {
    //extract validation error fromr eq

    const errors = validationResult(req);

    if (req.fileValidationError) {
      errors.imgInvalid = req.fileValidationError;
    }
    if (!errors.isEmpty()) {
      res.render(
        "brand_form",
        { title: "Create Brand", name: req.body.name, err: errors.array() },
        (imgInvalid = errors.imgInvalid)
      );
      return;
    } else {
      //Data is valid
      //Check if brand already exists
      Brand.findOne({ name: req.body.name }).exec(async function (
        err,
        found_brand
      ) {
        if (err) return next(err);
        if (found_brand) {
          //if already exists
          res.redirect(found_brand.url);
        } else {
          let result =
            req.file === undefined
              ? ""
              : await cloudinary.uploader.upload(req.file.path);
          const brand = new Brand({
            name: req.body.name,
            imgURL: result === "" ? "" : result.url,
          });
          brand.save(function (err) {
            if (err) return next(err);
            //category saved, redirect
            res.redirect(brand.url);
          });
        }
      });
    }
  },
];

//Display brand update form on GET
exports.brand_update_get = function (req, res, next) {
  Brand.findById(req.params.id).exec(function (err, brand) {
    if (err) return next(err);
    if (brand === null) {
      //doesnt exist, go back to brand
      const err = new Error("Brand Not Found");
      err.status = 404;
      return next(err);
    }
    res.render("brand_form", { title: "Update Brand", name: brand.name });
  });
};

//Handle brand update form on POST
exports.brand_update_post = [
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Category name must be specified")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Category name cannot contain non-alphanumeric character")
    .escape(),

  //process the req after validiation/sanitizaion
  async (req, res, next) => {
    //extract validation error fromr eq

    const errors = validationResult(req);

    if (req.fileValidationError) {
      errors.imgInvalid = req.fileValidationError;
    }
    if (!errors.isEmpty()) {
      res.render(
        "brand_form",
        { title: "Update Brand", name: req.body.name, err: errors.array() },
        (imgInvalid = errors.imgInvalid)
      );
      return;
    } else {
      let result =
        req.file === undefined
          ? ""
          : await cloudinary.uploader.upload(req.file.path);

      const brand = new Brand({
        name: req.body.name,
        imgURL: result === "" ? "" : result.url,
        _id: req.params.id,
      });
      //Data is valid

      Brand.findByIdAndUpdate(req.params.id, brand, function (err, thebrand) {
        if (err) return next(err);
        //Success so redirecet to updated category
        res.redirect(thebrand.url);
      });
    }
  },
];

//handle brand DELETE form on GET
exports.brand_delete_get = function (req, res, next) {
  res.send("Not implemented yet");
};

//hande brand DELETE form on POST
exports.brand_delete_post = function (req, res, next) {
  res.send("Not implemented yet");
};
