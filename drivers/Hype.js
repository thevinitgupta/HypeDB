import HypeData from "../class/hypeData.js";

class Hype{
    constructor(){}

    createCollection(collection, schema = {}){
        try {
            const db = new HypeData();
            db.createCollection(collection, schema);
        }
        catch(error){
            return {
                message : error.message,
                error,
            }
        }
    }

    find(collection, query={}, options={}, callback){
        const db = new HypeData();
        if(typeof collection === 'function') {
            callback = collection;
            collection = undefined;
        }
        if(typeof query === 'function') {
            callback = query;
            query = {};
        }
        if(typeof options === 'function') {
            callback = options;
            options = {};
        }
        db.readDataFromFile(collection).then((data) =>{
            try {
                data = data.filter((doc)=>{
                    let isMatch = true;
                    for(const key in query){
                        let filterValue = query[key];
                        if(typeof filterValue === 'object'){
                            isMatch = this.#handleQuery(doc, key, filterValue);
                            if(isMatch===false) break;
                        }
                        else if(doc[key]!==query[key]){
                            isMatch = false;
                            break;
                        }
                    }
                    return isMatch;
                });

                data = this.#handleOptions(data, options);

                if(callback){
                    callback(null,data);
                }
                
                return Promise.resolve(data);

            }catch(err){
                if(callback){
                    callback(err);
                }
                return Promise.reject(err);
            }
        })
        .catch((error)=>{
            if(callback){
                callback(error);
            }
            return Promise.reject(error);
        })
    }

    #handleQuery(doc,key, filter){
        let isMatch = true;
        for(const op in filter){
            if(op==="$gt" && doc[key]<=filter[op]){
                isMatch = false;
            }
            if(op=="$lt" && doc[key]>=filter[op]){
                isMatch = false;
            }
        }
        return isMatch;
    }

    #handleOptions(data,options){
        if(Object.keys(options).length===0) return data;

        if(options.sort){

        }

        if(options.limit){

        }
    }
}

export default Hype