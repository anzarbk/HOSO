const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../model/user");
const { model } = require("mongoose");

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    const user = await User.findOne({ email: email });

    if (user === null) {
      return done(null, false, { message: "No user with that email" });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        if (user.isBlocked) {
          return done(null, false, { message: "You were blocked by Admin" });
        }
        if(!user.verfied){
          return done(null, false, { message: "You were not verfied" });
          
        }
        res.render("user/otp");
        return done(null, user);
      } else {
        return done(null, false, { message: "password incorrect" });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(
    new LocalStrategy({ usernamefield: "username" }, authenticateUser)
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
      return done(null, user);
    });
  });
}
module.exports = initialize;
