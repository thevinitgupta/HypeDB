const express = require("express");
const app = express();
const HypeData = require("./class/hypeData")

require('dotenv').config();

const PORT = process.env.NODE_PORT;

app.use(express.json())

app.param('db', (req, res, next, name) => {
    const db = new HypeData(name);
    db.getAll();
    res.json(db.create({
        "name" : "Vimal Gupta",
        "age" : 27,
        "email" : "vamp.vim95@gmail.com"
    }));
    next();
});

//* Example : localhost:3000/User -> creates a User.json file
app.use('/:db',(req,res) =>{
    // res.json({
    //     code : 200,
    //     message : "Success"
    // })
});



app.listen(PORT, ()=>{
    console.log(`Server started on port : ${PORT}`)
});