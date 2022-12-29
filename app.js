require('dotenv').config()

const express=require('express')
const morgan = require('morgan')
const app=express();
const path=require('path')
const bcrypt=require('bcrypt')
const mongoose=require('mongoose')
const session=require('express-session')
const cookieParser=require('cookie-parser')
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const flash = require('express-flash')
const methodOverride = require('method-override')


//##################  DATABASE  #####################

const DB = process.env.DB_URI.replace('<password>',process.env.DB_PASSWORD)
console.log(DB);
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
app.use(cookieParser())
app.use(session({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  resave: false
}))
app.use(methodOverride('_method'))



app.use('/', userRouter);
app.use('/admin', adminRouter); 
app.use((req,res,next)=>{
 res.status(404).render('user/404')
})
// ##################################################

// ##################################################
app.listen(3000)
module.exports = app

































