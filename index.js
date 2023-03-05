const express = require("express");
const app = express();
const HypeData = require("./class/hypeData")

require('dotenv').config();

const PORT = process.env.NODE_PORT;

app.use(express.json())

app.param('db', (req, res, next, name) => {
    const db = new HypeData(name);
    res.json(db.get("_id","c41d332a-50d3-4b1c-ad62-1faa207eeff9"));
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