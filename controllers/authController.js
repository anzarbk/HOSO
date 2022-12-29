const bcrypt = require("bcrypt");
const User = require("../model/user");
const Admin = require("../model/admin");
const otpAuth = require("../utils/twilio");
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
      !req.body.mobile ||
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

    req.session.mobile = req.body.mobile;

    await otpAuth.sendVerifyToken(req.body.mobile);

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Creating the new user
    req.session.userDetails = {
      name: req.body.name,
      email: req.body.email,
      contactNumber: req.body.mobile,
      password: hashedPassword,
      verified: false,
    };

    res.render("user/otp");
  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
};
exports.resendOtp = async (req, res) => {
  console.log("asdasdas", req.session.mobile);
  await otpAuth.sendVerifyToken(req.session.mobile);
  res.json({
    status: true,
  });
};
//#############   OTP VERIFICATION   #####################
exports.otpVerification = async (req, res) => {
  console.log(req);
  console.log(req.session.hii);
  let verifyotp = req.body;
  let phone = req.session.mobile;
  let otp = verifyotp.one
    .concat(verifyotp.two)
    .concat(verifyotp.three)
    .concat(verifyotp.four)
    .concat(verifyotp.five)
    .concat(verifyotp.six);

  await otpAuth.checkVerificationToken(phone, otp).then(async (result) => {
    let userData = req.session.userDetails;
    if (result.status === "approved") {
      req.session.user = await User.create(userData);
      res.redirect("/");
    } else {
      res.redirect("/register");
    }
  });
};
//#############  USER LOGIN   #####################
exports.logInUser = async (req, res) => {
  let message;
  try {
    const user = await User.findOne({ email: req.body.username });
    if (user) {
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        message = "Email or Password does not match !!";
        console.log(
          "🚀 ~ file: authController.js ~ line 96 ~ exports.logInUser= ~ message",
          message
        );
        res.locals.message = message;
        return res.render("user/login");
      }
      req.session.user = user;
      return res.redirect("/");
    }
  } catch (err) {
    console.log(err);
  }
};
//#############  ADMIN LOGIN   #####################
exports.renderAdminAcc = async (req, res) => {
  let message;
  try {
    if (!req.body.email || !req.body.password) {
      message = "Fill all the fields";
      res.locals.message = message;
      return res.redirect("/admin/loginAdmin");
    }
    const admin = await Admin.findOne({ email: req.body.email });
    if (admin) {
      const isMatch = await bcrypt.compare(req.body.password, admin.password);
      if (isMatch) {
        req.session.admin = true;
        return res.redirect("/admin");
      } else {
        message = "email or password not correct";
        res.locals.message = message;
        return res.redirect("/admin/loginAdmin");
      }
    }
    if (!admin) {
      message = "admin not found";
      res.locals.message = message;
      return res.redirect("/admin/loginAdmin");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/admin/loginAdmin");
  }
};
//##########  CHECK ADMIN  MIDDLEWARE  ##############
exports.checkIfAdmin = async (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/loginAdmin");
  }
};
//#############  LOGOUT ADMIN  ######################
exports.logoutAdmin = (req, res) => {
  req.session.destroy();
  res.redirect("/admin/loginAdmin");
};
//##############  BLOCK & UNBLOCK USER  ##############

exports.activeUsers = async (req, res) => {
  id = req.params.id;
  await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
  res.redirect("/admin/user-list");
};
exports.blockedUsers = async (req, res) => {
  id = req.params.id;
  await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
  res.redirect("/admin/user-list");
};

//###############
exports.checkIsBlocked = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.username });
  if (user) {
    if (user.isBlocked) {
      res.locals.message = "You are being suspended";
      return res.render("user/login");
    } else {
      next();
    }
  } else {
    next();
  }
};

//###############
exports.isUserAuthed = async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  const user = await User.findById(req.session.user._id);
  if (!user) {
    return res.redirect("/login");
  }
  if (user.isBlocked) {
    return res.redirect("/login");
  }
  next();
};
exports.isUserAuthedAjax = async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.json({
      status: "failed",
      message: "User not logged in !",
    });
  }
  const user = await User.findById(req.session.user._id);
  if (!user) {
    return res.json({
      status: "failed",
      message: "User not found !",
    });
  }
  if (user.isBlocked) {
    return res.json({
      status: "failed",
      message: "User has been suspended !",
    });
  }
  next();
};
