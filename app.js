if(process.env.NODE_ENV !="production")
    {
    require('dotenv').config()
    }

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js")
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const router = express.Router();


const dbUrl=process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs"); //ye bhi
app.set("views", path.join(__dirname, "views")); //ye dono cheeze tb use krte h jb ejs file ko use kr rhe ho
app.use(express.urlencoded({ extended: true }));  //jab show route likhenge toh ye bhi likhenge
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); //css se link kiya h

const store=MongoStore.create(
{
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SECRET,},
        touchAfter:24 * 3600
    

})

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());          //info ko store krwana is serialize
passport.deserializeUser(User.deserializeUser());       //info ko unstore krwna is deserialize

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
     res.locals.error=req.flash("error");
     res.locals.currUser=req.user;
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//     let registeredUser= await  User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })  

// app.get("/", (req, res) => {
//     res.send("Hi,I am root");
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

const listingRoutes = require('./routes/listing.js');
app.use('/', listingRoutes);


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"));   //jab kisi se match na ho toh ye use krenge
});

app.use((err, req, res, next) => {
    let { statusCode=500, message="Something went wrong" } = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});