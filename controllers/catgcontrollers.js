const Category = require("../model/category");
const Product = require("../model/product");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const multerStorage = multer.memoryStorage();
const categoryModel = require("../model/category");

//#############  MULTER  ####################
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("File is not an image"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadCategoryPic = upload.fields([
  {
    name: "thumbnail",
    maxCount: 1,
  },
]);
exports.resizeCategoryPic = async (req, res, next) => {
  //Validations
  if (!req.files.thumbnail) return next();

  // Get the thumbnail
  req.body.thumbnail = `category-${Date.now()}-thumb.jpeg`;

  await sharp(req.files.thumbnail[0].buffer)
    .resize(450, 450)
    .toFormat("jpeg")
    .jpeg({
      quality: 90,
    })
    .toFile(`public/images/category/${req.body.thumbnail}`);

  // Get the images array
  // req.body.thumbnail = [];
  // await Promise.all(
  //   req.files.thumbnail.map(async (el, i) => {
  //     const filename = `category-${Date.now()}-${i + 1}-image.jpeg`;
  //     await sharp(req.files.thumbnail[i].buffer)
  //       .resize(450, 450)
  //       .toFormat("jpeg")
  //       .jpeg({
  //         quality: 90,
  //       })
  //       .toFile(`public/images/category/${filename}`);

  //     req.body.thumbnail.push(filename);
  //   })
  // );
  next();
};
//############  RENDER ADD  CATEGORY  ########################

exports.renderAddCategory = async (req, res) => {
  const categoryDetails = await categoryModel.find({}).sort({ _id: -1 });
  res.render("admin/category", { categoryDetails });
};
//############  ADD CATEGORY  ########################
exports.addingCategory = async (req, res) => {

    const data={...req.body}
    const category = await Category.findOne({ name: data.catgname });
    // req.session.category = true;
    if (!category) {
      
      await Category.create({
        name: data.catgname,
        discount: data.discount,
        thumbnail: data.thumbnail,
      });
      // const product = await Product.find()
      //  await Product.updateMany({"category": data.catgname}, {"$set":{"discount":data.discount }});
      res.locals.categoryDetails = await categoryModel.find({}).sort({ _id: -1 });
      res.redirect("/admin/main-category");
    }   
};
exports.deleteCategory=async (req,res)=>{
  id=req.params.id
  console.log(req.params)
  await Category.deleteOne({_id:id})
  res.redirect('/admin/main-category')
}


exports.categoryValidate=async (req,res,next)=>{
  let message;
  const categoryDetails = await Category.find();
  res.locals.categoryDetails = categoryDetails;
  
  try {    
   
    if (!req.body.thumbnail || !req.body.catgname) {
     
      message = "Fill all the fields";
      res.locals.message = message;
      res.locals.categoryDetails = await categoryModel.find({}).sort({ _id: -1 });
      return res.render("admin/category");
    }else{
      
      req.body.catgname=req.body.catgname.toUpperCase()
      const category = await Category.findOne({ name: req.body.catgname });
     if(category){
      
      
      message = "category already exist";
      res.locals.message = message;
      res.locals.categoryDetails = await categoryModel.find({}).sort({ _id: -1 });
      return res.render("admin/category");}
    }
    next();
  }catch(err){
    
  message = "Something went wrong !";
    res.locals.message = message;
    res.render("admin/404");
  }
}
