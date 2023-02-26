const fs = require("fs");
const {v4 : uuidv4, uuidValidateV4} = require("uuid")
const {Transform} = require("stream");
class HypeData{
    constructor(_dbName){
        this.databaseName = _dbName;
        this.databasePath = `./data/${this.databaseName}.json`;

        try{
            //create an empty file
            if(fs.existsSync(this.databasePath)==false){
                fs.writeFileSync(this.databasePath,JSON.stringify({}), {flag : 'wx'});
            }
            this.data = {}
            return this._handleData(null, {
                code : 200,
                data : {},
                message : 'Database Created'
            })
        }
        catch(error){
            return this._handleData(error, null);
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

    create(_data){
        const id = this._generateId();
        this._addNewField(id,_data);
    }

    update(_id, _data){
        if(!_id){
            const err = new Error('ID empty');
            err.code = 400;
            return this._handleData(err, null);
        }
        if(_id && (!_uuidValidateV4(_id))){
            const err = new Error('Invalid ID');
            err.code = 400;
            return this._handleData(err,null);
        }
        if(!_data){
            const err = new Error('Data empty');
            err.code = 400;
            return this._handleData(err, null);
        }
        
    }

    //private functions
    _addNewField(_id, _data){
        const newDoc = {};
        newDoc[_id] = _data;
        const newDocJson = JSON.stringify(newDocJson);

        const writeStream = fs.createWriteStream(this.databasePath, {flags : 'a'});

        writeStream.write(`,${newDocJson}`,(error) =>{
            if(error){
                return this._handleData(error, null);
            }
            return this._handleData(null, newDoc);
        })
        writeStream.end('');
    }

    _transform(action, _id, data){
        const transformStream = new Transform({
            writableObjectMode : true,
            transform(chunk, encoding, callback) {
                
            }
        })
    }

    _readDatabaseFile(){
        const readStream = fs.createReadStream(this.databasePath, { encoding: 'utf8' });
        const data = "";
        readStream.on('error',(error) =>{
            return this._handleData(error, null);
        })

        readStream.on('data', (chunk)=>{
            data += chunk;
        })

        readStream.on('end',async ()=>{
            try {
                const jsonData = await JSON.parse(data);
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

    _uuidValidateV4(_uuid) {
        return uuidValidateV4(_uuid);
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

module.exports = HypeData;