const express = require('express');
const app = express.Router();
const create  = require('./create.js');

//create
app.get("/create", create);
//read
//update
//delete

// TODO : Search
module.exports = app;