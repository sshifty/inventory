const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const cloudinary = require("../cloudinary");
const { body, validationResult } = require("express-validator");

//Display all categories

exports.category_get = function (req, res, next) {
  Category.find()
    .sort({ name: "asc" })
    .exec(function (err, list_categories) {
      if (err) return next(err);
      //Success so render page
      res.render("category_list", {
        title: "Categories",
        category_list: list_categories,
      });
    });
};

//Display all items of one category
exports.category_detail = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items: function (callback) {
        Item.find({ category: req.params.id })
          .populate("brand")
          .populate("category")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.category === null) {
        //no results
        const err = new Error("Category Not Found");
        err.status = 404;
        return next(err);
      } else {
        //Successful, so render!
        res.render("category_detail", {
          title: results.category.name,
          items: results.category_items,
          category: results.category,
        });
      }
    }
  );
};

//Display Category create form on GET
exports.category_create_get = function (req, res, next) {
  res.render("category_form", { title: "Create Category" });
};

//Handle author create on post
exports.category_create_post = [
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
      console.log(errors.array());
      res.render(
        "category_form",
        { title: "Category Form", name: req.body.name, err: errors.array() },
        (imgInvalid = errors.imgInvalid)
      );
      return;
    } else {
      //Data is valid
      //Check if category already exists
      Category.findOne({ name: req.body.name }).exec(async function (
        err,
        found_cat
      ) {
        if (err) return next(err);
        if (found_cat) {
          //if already exists
          res.redirect(found_cat.url);
        } else {
          let result =
            req.file === undefined
              ? ""
              : await cloudinary.uploader.upload(req.file.path);
          const category = new Category({
            name: req.body.name,
            imgURL: result === "" ? "" : result.url,
          });
          category.save(function (err) {
            if (err) return next(err);
            //category saved, redirect
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

//Display category update form on GET
exports.category_update_get = function (req, res, next) {
  Category.findById(req.params.id).exec(function (err, category) {
    if (err) return next(err);
    res.render("category_form", {
      title: "Update Category",
      name: category.name,
    });
  });
};

//Handle category update form on POST
exports.category_update_post = [
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
        "category_form",
        { title: "Update Category", name: req.body.name, err: errors.array() },
        (imgInvalid = errors.imgInvalid)
      );
      return;
    } else {
      let result =
        req.file === undefined
          ? ""
          : await cloudinary.uploader.upload(req.file.path);

      const category = new Category({
        name: req.body.name,
        imgURL: result === "" ? "" : result.url,
        _id: req.params.id,
      });
      //Data is valid

      Category.findByIdAndUpdate(
        req.params.id,
        category,
        function (err, thecategory) {
          if (err) return next(err);
          //Success so redirecet to updated categoryl
          console.log(category, thecategory);
          res.redirect(thecategory.url);
        }
      );
    }
  },
];

//handle category DELETE form on GET
exports.category_delete_get = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      cat_items: function (callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.category === null) {
        //no category
        res.redirect("/catalog/categories");
      } else {
        console.log(results);
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          items: results.cat_items,
        });
        return;
      }
    }
  );
};

//hande category DELETE form on POST
exports.category_delete_post = function (req, res, next) {
  res.send("Not implemented yet");
};
