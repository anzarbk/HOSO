const bcrypt = require("bcrypt");
const User = require("../model/user");
const Admin = require("../model/admin");
const passport = require("passport");
const initializePassport = require("../config/passport");
initializePassport(passport);
const otpAuth = require('../utils/twilio');
const user = require("../model/user");

let phone;
let id;
//#############  USER  REGISTERING   #####################
exports.registerUser = async (req, res) => {
 
  let message;
  // Validation
  try {
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.password ||
      !req.body.conform
    ) {
      message = "Fill all the fields";
      res.locals.message = message;
      return res.render("user/register");
    }

    // check if Passwords match
    if (req.body.password !== req.body.conform) {
      message = `Passwords doesn't match`;
      res.locals.message = message;
      return res.render("user/register");
    }

    // Check if email already taken
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      message = "Email already registered !";
      res.locals.message = message;
      return res.render("user/register");
    }

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Creating the new user
    let newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      contactNumber: req.body.mobile,
      password: hashedPassword,
      verified:false
    });
    req.session.newUser = newUser._id
    phone=req.body.mobile
    otpAuth.sendVerifyToken(phone).then((val)=>{
      console.log(val)
      res.render("user/otp");
    })
  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
};
//#############   OTP VERIFICATION   #####################
exports.otpRenderIndex=async(req,res)=>{
  console.log(req.body);
  
let verifyotp=req.body
    
    let otp=verifyotp.one.concat
    (verifyotp.two).concat
    (verifyotp.three).concat
    (verifyotp.four).concat
    (verifyotp.five).concat
    (verifyotp.six) 
    console.log(otp)
   otpAuth.checkVerificationToken(phone,otp).then(async (result)=>{
    if(result === "approved"){
      await User.updateOne({_id:req.session.newUser},{$set:{verified:true}})
      res.redirect('/')
    }else{
      res.redirect('/register')
    }
   })
      
}
//#############  USER PASSPORT LOGIN   #####################
exports.renderAcc =   passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
})
//#############  ADMIN LOGIN   #####################
exports.renderAdminAcc= async (req, res) => {
  let message;
  
  try {
    if (!req.body.email || !req.body.password) {
      message = "Fill all the fields";
      res.locals.message = message;
      return res.redirect('/admin/loginAdmin');
    }
    const admin = await Admin.findOne({ email: req.body.email });
    console.log(admin);
    if (admin) {
      const isMatch = await bcrypt.compare(req.body.password, admin.password);
      if (isMatch) {

        req.session.admin = true;
        return res.redirect('/admin');
      } else {
        message = "email or password not correct";
        console.log("🚀 ~ file: authController.js ~ line 70 ~ exports.renderAcc= ~ message", message)
      res.locals.message = message;
      return res.redirect('/admin/loginAdmin');

      }
    }
    if (!admin) {
      message = "admin not found";
      console.log("🚀 ~ file: authController.js ~ line 77 ~ exports.renderAcc= ~ message", message)
      res.locals.message = message;
      return res.redirect('/admin/loginAdmin');

    }
  } catch (err) {
    console.log(err);
    res.redirect("/admin/loginAdmin");
  }
};
//##########  CHECK ADMIN  MIDDLEWARE  ##############
exports.checkIfAdmin=async(req,res,next)=>{
  if(req.session.admin){
    next();
  }else{
    res.redirect('/admin/loginAdmin')
  }
  // const admin=await Admin.findOne(email:email)
}
//#############  LOGOUT ADMIN  ######################
exports.logoutAdmin=(req,res)=>{
  req.session.destroy();
  res.redirect('/admin/loginAdmin')
}
//##############  BLOCK & UNBLOCK USER  ##############

exports.activeUsers=async(req,res)=>{
  id=req.params.id
  await User.updateOne({_id:id},
    {$set:{isBlocked:false}})
    res.redirect('/admin/user-list')
};
exports.blockedUsers=async(req,res)=>{
  id=req.params.id
  console.log(id);
  await User.updateOne({_id:id},{$set:{isBlocked:true}})
  res.redirect('/admin/user-list')
}

//###############  AUTHENTICATE USER PASSPORT  ##########
exports.checkAuthenticated=(req,res,next)=>{
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/login')
}
exports.checkNotAuthenticated = (req,res,next)=>{
     if(req.isAuthenticated()){
       return res.redirect('/')
     }
       next()}
    
exports.checkIsBlocked=async(req,res,next)=>{
  console.log(req.user)
  const id=req.user._id
  const user=await User.findById(id)
  if(user.isBlocked){
    req.logOut(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
  })
}else{
    next()
  }
}