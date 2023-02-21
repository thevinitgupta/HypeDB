const fs = require("fs");
class HypeData{
    constructor(dbName){
        this.databaseName = dbName;
        this.databasePath = `../data/${this.databaseName}.json`;

        //create an empty file
        if(!fs.existsSync(this.databasePath)){
            fs.writeFileSync(this.databasePath,JSON.stringify({}));
        }
    }

    create(data){

    }



    //private functions
    _addNewField(_id, _obj){

    }
}