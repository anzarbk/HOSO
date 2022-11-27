if(process.env.NODE_ENV !=='production'){
  require('dotenv').config()
}


const express=require('express')
const morgan = require('morgan')
const app=express();
const path=require('path')
const bcrypt=require('bcrypt')
const mongoose=require('mongoose')
const session=require('express-session')
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const passport = require('passport')
const initializePassport = require('./config/passport')
const flash = require('express-flash')
const methodOverride = require('method-override')




//##################  DATABASE  #####################

const DB = 'mongodb://127.0.0.1:27017/HOSOPOSQUE';
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  });


// ##################################################
// initializePassport(
//   passport,
//   email => user.find(user => user.email === email),
//   id => user.find(user => user.id === id)
//   );

  //##################  TWILIO  ######################

// function sendTextMessage(){
// client.messages.create({
//   body: 'Hello from Node',
//   to: '+14254752096',
//   from: '+19605823106'
// }).then(message => console.log(message))
//  // here you can implement your fallback code
//  .catch(error => console.log(error))
// }
//##############  EJS SETTING  ################################
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'))

// ##################################################
app.use(express.static(path.join(__dirname,'public')))
app.use(express.json()) 
app.use(express.urlencoded({extended:true}))
app.use(morgan('dev'))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
saveUninitialized: false,
cookie:{
  maxAge:1000*60*60
}
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.use('/', userRouter);
app.use('/admin', adminRouter); 

// ##################################################

// ##################################################
app.listen(3000)
module.exports = app

































