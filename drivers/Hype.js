import HypeData from "../class/hypeData";

export default class Hype{
    constructor(){}

    createCollection(collection, schema = {}, data = [], callback){
        const db = new HypeData(collection,schema);
        if(data.length===0) return db;

        try{
            data.forEach((doc) =>{
                db.create(doc);
            })
        }
        catch(error){

        }
        
    }
    get(query){
        
    }
}