const express = require("express");
const app = express();
const HypeData = require("./class/hypeData")

require('dotenv').config();

const PORT = process.env.NODE_PORT;

app.use(express.json())

app.param('db', (req, res, next, name) => {
    const db = new HypeData(name);
    db.update(3,{
        name : 'Vinit Gupta',
        email : "thevinitgupta@gmail.com",
        age : 22
    });
    next();
  });

const ops = require('./operations/index.js');

//* Example : localhost:3000/User -> creates a User.json file
app.use('/:db',(req,res) =>{
    res.json({
        status : 200,
        data : [],
        message : 'User created successfully'
    });
});



app.listen(PORT, ()=>{
    console.log(`Server started on port : ${PORT}`)
});