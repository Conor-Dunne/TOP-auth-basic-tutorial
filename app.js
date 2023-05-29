const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Load environment variables from .env file
require('dotenv').config();


// Set up mongoose connection
const mongoDb = process.env.MONGO_URL;

mongoose.connect(mongoDb, {useUnifiedTopology: true, useNewUrlParser: true});
const db= mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));
db.on("open", () => {
    console.log("MongoDB connection successful");
  });
  
const User = mongoose.model(
    "User",
    new Schema({
        username: {type: String, required: true},
        password: {type: String, required: true}
    })
);

const app = express();

// view engine setup
app.set("views", __dirname);
app.set("view engine", "ejs");

passport.use(
    new LocalStrategy(async(username, password, done) => {
        try{
            const user = await User.findOne({ username: username});
            if(!user) {
                return done(null, false, { message: "Incorrect username"});
            };
            if (user.password !== password) {
                return done(null , false, { message: "Incorrect password"});
            };
            return done(null, user);
        } catch(err) {
            return done(err);
        };
    })
)

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(async function(id, done){
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch(err) {
        done(err);
    }
})

app.use(session({secret: "cats", resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: false}));

app.get("/", (req, res) => {
    console.log(req.user)
    res.render("index", { user: req.user });
  });
app.get("/sign-up", (req, res) => res.render("sign-up-form"));
app.get("/log-out", (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });


app.post("/sign-up", async (req, res, next) => {
    try {
      const user = new User({
        username: req.body.username,
        password: req.body.password
      });
      const result = await user.save();
      res.redirect("/");
    } catch(err) {
      return next(err);
    };
  });

app.post(
    "/log-in",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/"
    })
);

  
app.listen(3000, ()=> console.log("app listening on port 3000!"));


