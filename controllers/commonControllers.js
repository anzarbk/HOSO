//#############  MAIN  ##########################

const admin = require("../model/admin")
const ProductModel = require("../model/product");
const User = require("../model/user");
const Category = require('../model/category');
const { ConversationList } = require("twilio/lib/rest/conversations/v1/conversation");

//#############  COMMON ALL #####################
module.exports.renderHome=async(req,res)=>{
   
    const profile=req.user
    
    // const profile=await User.findById(user_id)    
    // const productView=await ProductModel.findById(_id)
    
    const productDetails= await ProductModel.find({}).sort({_id:-1}).populate('category')
    const categoryDetails = await Category.find()
    
    // console.log("profile,",profile)
    res.render('user/index',{productDetails,categoryDetails,profile})
}
exports.renderRegister=(req,res)=>{
    res.render('user/register')
}
exports.registerUser=(req,res)=>{
    res.render('user/login')
}
exports.renderLogin=(req,res)=>{
    res.render('user/login')
}
exports.renderOutToLogin=(req, res, next)=>{
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
 })}
exports.renderShop=async(req,res)=>{
    const profile=req.user
    const productDetails= await ProductModel.find({}).sort({_id:-1})
    const categoryDetails = await Category.find({})
    res.render('user/shop',{categoryDetails,productDetails,profile})
}
exports.renderContact=async(req,res)=>{
    const profile=req.user
    const categoryDetails = await Category.find({})
    res.render('user/contact',{categoryDetails,profile})
}
exports.renderProduct=async(req,res)=>{
    const profile=req.user
    const {_id}=req.query
   const productView=await ProductModel.findById(_id)
    const categoryDetails = await Category.find({})
    res.render('user/product',{categoryDetails,productView,profile})
}
//###############  USER  ######################

exports.renderGridUser=(req,res)=>{
    res.render('admin/user-card')
}
exports.renderListUser=async (req,res)=>{
  
        const userDetails=await User.find()
        res.render('admin/user-list',{userDetails})
}
exports.renderProfileUSer=(req,res)=>{
    res.render('admin/user-profile')
}
exports.renderLogout=(req,res)=>{
    
         
    res.status(200).clearCookie('connect.sid', {
      path: '/admin/loginAdmin'
    });
    req.session.destroy(function (err) {
      res.redirect('/admin/loginAdmin');
    });
  }
  
//###########  CART  ############################

exports.renderCart=async(req,res)=>{
    const profile=req.user
 
    const categoryDetails = await Category.find({})
   
    res.render('user/shopping-cart',{categoryDetails,productView,profile})
}
exports.renderCheckout=async(req,res)=>{
    const profile=req.user
    const categoryDetails = await Category.find({})
    res.render('user/check-out.ejs',{categoryDetails,profile})
}
exports.signUp = async (req,res)=>{
    const {email, name, password} = req.body

    const adminacc = {
        name,email,password
    }

    let status = await admin(adminacc).save()
    console.log('saved')
}
exports.renderUserLogout=(req,res)=>{
    
         
    res.status(200).clearCookie('connect.sid', {
      path: '/user/login'
    });
    req.session.destroy(function (err) {
      res.redirect('/user/login');
    });
}

//########################################################################################
//######################################   ADMIN   #######################################
//#########################################################################################
//#######################   LOGIN    ########################

exports.getloginToAdmin=(req,res)=>{
    res.render('admin/loginAdmin')
}
exports.renderDashboard=(req,res)=>{
    if(req.session.admin){
        res.render('admin/dashboard')
    }else{
        res.redirect('/admin/loginAdmin')
    }
   
}
