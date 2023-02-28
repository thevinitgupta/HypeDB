const fs = require("fs");
const {v4 : uuidv4, version : uuidVersion , validate : uuidValidate } = require("uuid")
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
            // return this._handleData(null, {
            //     code : 200,
            //     data : {},
            //     message : 'Database Created'
            // })
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
        if(_id && (!this._uuidValidateV4(_id))){
            const err = new Error('Invalid ID');
            err.code = 400;
            return this._handleData(err,null);
        }
        if(!_data){
            const err = new Error('Data empty');
            err.code = 400;
            return this._handleData(err, null);
        }

        const readStream = fs.createReadStream(this.databasePath);

        const transformStream = this._transform('UPDATE', _id, _data);

        const writeStream = fs.createWriteStream(this.databasePath);

        readStream
        .pipe(transformStream)
        .pipe(writeStream)
        .on('error', err => this._handleData(err, null))
        .on('finish', () => this._handleData(null, data));
    }

    //private functions
    _addNewField(_id, _data){
        // const readStream = fs.createReadStream(this.databasePath);

        // const transformStream = this._transform('CREATE', _id, _data);

        // const writeStream = fs.createWriteStream(this.databasePath);

        // readStream
        // .pipe(transformStream)
        // .pipe(writeStream)
        // .on('error', err => this._handleData(err, null))
        // .on('finish', () => this._handleData(null, data));
        const newDoc = {..._data};
        const newDocJson = JSON.stringify(newDoc);
        console.log(this.databasePath)
        const dbData = this._readDatabaseFile();

        dbData[_id] = newDocJson;
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
        const encoding = 'utf8';
        const transformStream = new Transform({
            objectMode : true,
            transform(chunk, encoding, callback) {
                let updatedChunk;
                try {
                    const parsedChunk = JSON.parse(chunk);
                    console.log(parsedChunk);
                    if(action === 'CREATE'){
                        console.log("CREATE");
                    }
                    if(action === 'DELETE') {
                        delete parsedChunk[_id];
                    }
                    else if(action === 'UPDATE') {
                        parsedChunk[_id] = data;
                    }
                    updatedChunk = JSON.stringify(parsedChunk);
                }
                catch(error){
                    return this._handleData(error,null);
                }
                callback(null,updatedChunk);
            },
            flush() {
                console.log('flush');
            }
        })
        return transformStream;
    }

    _readDatabaseFile(){
        const readStream = fs.createReadStream(this.databasePath, { encoding: 'utf8' });
        const data = "";
        readStream.on('error',(error) =>{
            return this._handleData(error, null);
        })

        readStream.on('data', (chunk)=>{
            console.log(chunk);
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
        return uuidValidate(_uuid) && uuidVersion(_uuid) === 4;;
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