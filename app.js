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


