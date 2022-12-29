const Review = require('../model/review')
const Product = require('../model/product'); 

exports.review = async(req,res)=>{
    const review = await Review.find().populate([{
        path: 'user',
        model: 'User'
    }, {
        path: 'product',
        model: 'Product'
    }])
    console.log("🚀 ~ file: reviewController.js:6 ~ exports.review=async ~ review", review)
   
    res.render('admin/review-list',{review})
}

exports.addReview = async(req,res)=>{
    const productId=req.query.product
    const {rating,comment} = req.body
    if(!rating||!comment){
        res.locals.message = 'fill all the fields!';
      return res.render(`product?_id=${productId}`)
    }
    const review = {
        user: req.session.user._id,
        product:productId,
        content:comment,
        rating,
      };
      await Review.create(review);
      res.redirect(`/product?_id=${productId}`);
}

exports.deleteReview = async(req,res)=>{
    id=req.params.id
    console.log("🚀 ~ file: reviewController.js:32 ~ exports.deleteReview ~ id", id)
    await Review.deleteOne({ _id: id });
    res.redirect("/admin/review");
}