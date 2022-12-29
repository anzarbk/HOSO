const Banner = require('../model/banner');
const Product = require('../model/product')
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

exports.listBannerPage = async(req,res)=>{
    
    const banner = await Banner.find().sort({ _id: -1 })
    res.render('admin/banner-list',{banner})
}
exports.addBannerPage = (req,res)=>{
    res.render('admin/banner-add')
}
////////////////////////////////////////////////////////////////////////////
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('File is not an image'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadBannerImage = upload.single('image');

////////////////////////////////////////////////////////////////////////////
exports.resizeBannerImage = (req, res, next) => {
  if (!req.file || !req.file.buffer) return next();

  req.file.filename = `${req.body.name}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
    // .resize(500, 500, { fit: 'contain' })
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/images/banner/${req.file.filename}`);

  next();
};

////////////////////////////////////////////////////////////////////////////

exports.addBanner = async(req,res)=>{
    
    console.log(req.body);
  if(!req.body.name ||
    !req.body.product ){
      res.locals.message = 'Not found valid data on fields while creating Banner !';
      return res.render('admin/banner-add')
    }
    const url = await Product.findOne({product_name:req.body.product})
    let id;
    if(url){
      id=url._id
    }else{
      res.locals.message = 'Not found product !';
        return res.render('admin/banner-add')
    }
    const data = {name:req.body.name,url:`/product?_id=${id}`};
      const banner = await Banner.find({ name: data.name });

    // banner already exists
      if (banner.lenght>0) {
        res.locals.message = 'Banner name already exists';
        return res.render('admin/banner-add')
      }
    
    // data refinement
      if (req.file) {
        data.image = req.file.filename;
      } else {
        delete data.image;
      }
    // Create banner
      await Banner.create(data);
      res.redirect('/admin/list-banner');
    
}
exports.editBannerpage = async(req,res)=>{
    const data = req.params.id
    const banner = await Banner.findOne({_id:data})
    res.render('admin/banner-edit',{banner})
}
exports.updateBanner = async(req,res)=>{
    const banner = await Banner.find()
    res.locals.banner=banner;
    console.log(req.body);
    const data = { ...req.body };
    const { id } = req.params;
    try {
        // Validation
        if (
          !data.name ||
          !data.product 
        ) {
          res.locals.message= 'Not found valid data on fields while editing Banner !';
          return  res.render('admin/banner-edit')
        }
      
        // data refinement
        if (req.file) {
            
            console.log("🚀 ~ file: bannerController.js:108 ~ exports.updateBanner=async ~ req.file", req.file)
          const banner = await Banner.findById(id);
          console.log("🚀 ~ file: bannerController.js:110 ~ exports.updateBanner=async ~ banner", banner)
          if (banner.image !== '01.png') {
            fs.unlink(
              path.join(__dirname, `../../public/images/banner/${banner.image}`),
              (err) => {
                if (err) {
                 console.log(err);
                }
              }
            );
          }
          data.name = data.name.toLowerCase();
          data.image = req.file.filename;
        } else {
          delete data.image;
        }
      
        await Banner.findByIdAndUpdate(id, data);
        return  res.redirect('/admin/list-banner'); 
        
    } catch (err) {
        res.render('/admin/404')
    }
}
exports.deleteBanner = async (req,res)=>{
    const  id  = req.params.id;
    console.log("🚀 ~ file: bannerController.js:141 ~ exports.deleteBanner ~ id", id)
    await Banner.deleteOne({ _id: id });
    // request
    const banner = await Banner.find({});
    res.render('admin/banner-list',{banner})

}