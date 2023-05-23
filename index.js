import express from "express"
const app = express();
import Hype from "./drivers/Hype.js";
import dotenv from "dotenv"

dotenv.config();

const PORT = process.env.NODE_PORT;

app.use(express.json())

app.param('db', (req, res, next, name) => {
    const db = new Hype();
    
    // res.json(db.update("7206f80f-958c-4ec7-b76f-9b8ab171c5bd", "age", 28));
    db.find("User",{
       
    }, {"sort" : {"name": 1, "email": -1}}, (error, data) =>{
        if(error) {
            res.json({
            message : error.message
            })
        }
        else res.json({
            data
        })
    })
    // res.json(db.create({
    //     "name" : "Vimal Gupta",
    //     "age" : 27,
    //     "email" : "vamp.vim95@gmail.com"
    // }));
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