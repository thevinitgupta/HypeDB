const express = require("express");
const app = express();

require('dotenv').config();

const PORT = process.env.NODE_PORT;

app.get("/",(req,res)=>{
    res.send("Welcome to HypeDB")
});

app.listen(PORT, ()=>{
    console.log(`Server started on port : ${PORT}`)
});