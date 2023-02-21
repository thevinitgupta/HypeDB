const express = require("express");
const app = express();

require('dotenv').config();

const PORT = process.env.NODE_PORT;

const ops = require('./operations/index.js');
app.use('/',ops);

app.listen(PORT, ()=>{
    console.log(`Server started on port : ${PORT}`)
});