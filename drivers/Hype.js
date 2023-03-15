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
    /**
     * 
     * @param {array} data 
     * @param {object} options 
     * @returns array
     * {sort : {age : 1}, {name : -1}}
     */
    #handleOptions(data,options){
        if(Object.keys(options).length===0) return data;
        console.log(options["sort"]!==undefined)
        if(options["sort"]!==undefined && typeof options["sort"]=='object'){
            let option = options["sort"];

            for(const key in option){
                let order = option[key];
                data.sort((docA,docB) => {
                    if(order>0) return docA[key]-docB[key] || docA[key].localeCompare(docB[key]);
                    else if(order<0) return docB[key]-docA[key]  || docB[key].localeCompare(docA[key]);
                    else return 0;
                });
            }
            
        }

        if(options["limit"]!==undefined && typeof options["limit"]==='number'){
            data = data.slice(0,options["limit"]);
        }
        return data;
    }
}

export default Hype