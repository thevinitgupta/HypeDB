const fs = require("fs");
const {v4 : uuidv4, uuidValidateV4} = require("uuid")
class HypeData{
    constructor(dbName){
        this.databaseName = dbName;
        this.databasePath = `../data/${this.databaseName}.json`;

        //create an empty file
        if(!fs.existsSync(this.databasePath)){
            fs.writeFileSync(this.databasePath,JSON.stringify({}));
        }
    }

    getAll(){
        const data = this._readDatabaseFile();
        return data;
    }

    get(_id){
        if(!_id){
            const err = new Error('ID empty');
            err.code = 400;
            return this._handleData(err, null);
        }
        if(_id && !_uuidValidateV4(_id)){
            const err = new Error('Invalid ID');
            err.code = 400;
            return this._handleData(err,null);
        }

        const data = this._readDatabaseFile();
        return data[_id];
    }

    create(data){
        const _id = this._generateId();

    }



    //private functions
    _addNewField(_id, _obj){

    }

    async _readDatabaseFile(){
        const readStream = fs.createReadStream(this.databasePath, { encoding: 'utf8' });
        const data = "";
        readStream.on('error',(error) =>{
            return this._handleData(error, null);
        })

        readStream.on('data', (chunk)=>{
            data += chunk;
        })

        readStream.on('end',()=>{
            try {
                const jsonData = JSON.parse(data);
                return this._handleData(null, jsonData);
            }
            catch(error){
                return this._handleData(error, null);
            }
        })
    }

    _generateId(){
        return uuidv4();
    }

    _uuidValidateV4(uuid) {
        return uuidValidateV4(uuid);
    }

    _handleData(error, data){
        if (error) {
            console.error(error);
            return {
                code : error.code || 500,
                data : null,
                message : error.message || 'Internal Server Error'
            };
          }
          return {
            code : 200,
            data,
            message : 'Success'
          }
    }
}