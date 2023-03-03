const fs = require("fs");
const {v4 : uuidv4, version : uuidVersion , validate : uuidValidate } = require("uuid")
const {Transform} = require("stream");
const { resolve } = require("path");
class HypeData{
    constructor(databasePath) {
        this.databasePath = databasePath;
        this.data = {};
        this.loadDatabase();
      }
    
      loadDatabase() {
    
    const readStream = fs.createReadStream(this.databasePath, { encoding: 'utf8' });
    let data = '';

    readStream.on('data', (chunk) => {
      data += chunk;
    });

    readStream.on('end', () => {
      this.data = JSON.parse(data);
    });

    readStream.on('error', (error) => {
      if (error.code === 'ENOENT') {
        fs.writeFileSync(this.databasePath, JSON.stringify({}));
        this.data = {};
      } else {
        throw error;
      }
    });
  }

  getById(id) {
    const transformStream = new Transform({
      objectMode: true,
      transform: function (chunk, encoding, callback) {
        if (chunk[id]) {
          this.push(chunk[id]);
        }
        callback();
      },
    });

    fs.createReadStream(this.databasePath, { encoding: 'utf8' })
      .pipe(transformStream)
      .on('data', (data) => {
        console.log(`Data for ID ${id}:`, data);
      })
      .on('error', (error) => {
        console.error('Error reading data:', error);
      });
  }

  getAll() {
    const transformStream = new Transform({
      objectMode: true,
      transform: function (chunk, encoding, callback) {
        Object.keys(chunk).forEach((key) => {
          this.push(chunk[key]);
        });
        callback();
      },
    });

    fs.createReadStream(this.databasePath, { encoding: 'utf8' })
      .pipe(transformStream)
      .on('data', (data) => {
        console.log('Data:', data);
      })
      .on('error', (error) => {
        console.error('Error reading data:', error);
      });
  }

  update(id, newData) {
    const transformStream = new Transform({
      objectMode: true,
      transform: function (chunk, encoding, callback) {
        if (chunk[id]) {
          chunk[id] = { ...chunk[id], ...newData };
        }
        this.push(chunk);
        callback();
      },
    });

    fs.createReadStream(this.databasePath, { encoding: 'utf8' })
      .pipe(transformStream)
      .pipe(fs.createWriteStream(this.databasePath))
      .on('finish', () => {
        console.log(`Data for ID ${id} updated successfully.`);
      })
      .on('error', (error) => {
        console.error(`Error updating data for ID ${id}:`, error);
      });
  }

  delete(id) {
    const transformStream = new Transform({
      objectMode: true,
      transform: function (chunk, encoding, callback) {
        if (chunk[id]) {
          delete chunk[id];
        }
        this.push(chunk);
        callback();
      },
    });

    fs.createReadStream(this.databasePath, { encoding: 'utf8' })
      .pipe(transformStream)
      .pipe(fs.createWriteStream(this.databasePath))
      .on('finish', () => {
        console.log(`Data for ID ${id} deleted successfully.`);
      })
      .on('error', (error) => {
        console.error(`Error deleting data for ID ${id}:`, error);
      });
  }
        
    // constructor(_dbName){
    //     this.databaseName = _dbName;
    //     this.databasePath = `./data/${this.databaseName}.json`;
    //     this.transformStream = new Transform({
    //         objectMode: true,
    //         transform(chunk, encoding, callback) {
    //           // Update the data in the chunk with the new data
    //           const newData = this.updatedData[chunk._id];
    //           if (newData) {
    //             const updatedData = { ...chunk, ...newData };
    //             this.push(updatedData);
    //             this.updatedData[chunk._id] = null;
    //           } else {
    //             this.push(chunk);
    //           }
    //           callback();
    //         },
    //         flush(callback) {
    //           // Write any remaining updated data to the file
    //           const writeData = JSON.stringify(this.updatedData).replace(/null/g, 'undefined');
    //           this.push(writeData);
    //           callback();
    //         },
    //       });
    //       this.updatedData = {};
    //       this.data = this._readDatabaseFile();
    //     try{
    //         //create an empty file
    //         if(fs.existsSync(this.databasePath)==false){
    //             fs.writeFileSync(this.databasePath,JSON.stringify({}), {flag : 'wx'});
    //         }
            
    //         console.log(this)
    //         // return this._handleData(null, {
    //         //     code : 200,
    //         //     data : {},
    //         //     message : 'Database Created'
    //         // })
    //     }
    //     catch(error){
    //         return this._handleData(error, null);
    //     }
    // }

    // getAll(){
    //     this._readDatabaseFile();
    //     return this._handleData(null,this.data);
    // }

    // get(_id){
    //     if(!_id){
    //         const err = new Error('ID empty');
    //         err.code = 400;
    //         return this._handleData(err, null);
    //     }
    //     if(_id && !_uuidValidateV4(_id)){
    //         const err = new Error('Invalid ID');
    //         err.code = 400;
    //         return this._handleData(err,null);
    //     }

    //     const data = this._readDatabaseFile();
    //     return data[_id];
    // }

    // create(_data){
    //     const id = this._generateId();
    //     this._addNewField(id,_data);
    // }

    // updateField(dataToUpdate, fieldToUpdate, newFieldValue) {
    //     this._readDatabaseFile();
    //     // Find the old data in the database
    //     console.log("from update Function \n"+JSON.stringify(this.data["9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"]))
    //     const oldData = this.data["9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"];
    //     if (!oldData) {
    //       const error = new Error('Data to update not found.');
    //       this._handleData(error,null);
    //       return;
    //     }
    
    //     // Update the data with the new field value
    //     const updatedData = { ...oldData, [fieldToUpdate]: newFieldValue };
    //     this.updatedData["9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"] = updatedData;
    
    //     // Pipe the read stream to the transform stream to update the data
    //     const readStream = fs.createReadStream(this.filePath, { encoding: 'utf8' })
    //       .on('error', (error) => {
    //         this._handleData(error);
    //       });
    
    //     readStream.pipe(this.transformStream)
    //       .on('error', (error) => {
    //         this._handleData(error);
    //       });
    
    //     // Write the updated data to the file using the write stream
    //     this.writeStream.write('', () => {
    //       this._handleData(null);
    //     });
    
    //     // Listen for the 'error' event of the write stream to handle any errors
    //     this.writeStream.on('error', (error) => {
    //       this._handleData(error,null);
    //     });
    //   }

    // update(_id, _data){
    //     if(!_id){
    //         const err = new Error('ID empty');
    //         err.code = 400;
    //         return this._handleData(err, null);
    //     }
    //     if(_id && (!this._uuidValidateV4(_id))){
    //         const err = new Error('Invalid ID');
    //         err.code = 400;
    //         return this._handleData(err,null);
    //     }
    //     if(!_data){
    //         const err = new Error('Data empty');
    //         err.code = 400;
    //         return this._handleData(err, null);
    //     }

    //     // const readStream = fs.createReadStream(this.databasePath);

    //     // const transformStream = this._transform('UPDATE', _id, _data);

    //     // const writeStream = fs.createWriteStream(this.databasePath);

    //     // readStream
    //     // .pipe(transformStream)
    //     // .pipe(writeStream)
    //     // .on('error', err => this._handleData(err, null))
    //     // .on('finish', () => this._handleData(null, data));
    // }

    // //private functions
    // _addNewField(_id, _data){
    //     // const readStream = fs.createReadStream(this.databasePath);

    //     // const transformStream = this._transform('CREATE', _id, _data);

    //     // const writeStream = fs.createWriteStream(this.databasePath);

    //     // readStream
    //     // .pipe(transformStream)
    //     // .pipe(writeStream)
    //     // .on('error', err => this._handleData(err, null))
    //     // .on('finish', () => this._handleData(null, data));
    //     const newDoc = {..._data};
    //     const newDocJson = JSON.stringify(newDoc);
    //     console.log(this.databasePath)
    //     const dbData = this._readDatabaseFile();

    //     dbData[_id] = newDocJson;
    //     const writeStream = fs.createWriteStream(this.databasePath, {flags : 'a'});

    //     writeStream.write(`,${newDocJson}`,(error) =>{
    //         if(error){
    //             return this._handleData(error, null);
    //         }
    //         return this._handleData(null, newDoc);
    //     })
    //     writeStream.end('');
    // }

    // _transform(action, _id, data){
    //     const encoding = 'utf8';
    //     const transformStream = new Transform({
    //         objectMode : true,
    //         transform(chunk, encoding, callback) {
    //             let updatedChunk;
    //             try {
    //                 const parsedChunk = JSON.parse(chunk);
    //                 console.log(parsedChunk);
    //                 if(action === 'CREATE'){
    //                     console.log("CREATE");
    //                 }
    //                 if(action === 'DELETE') {
    //                     delete parsedChunk[_id];
    //                 }
    //                 else if(action === 'UPDATE') {
    //                     parsedChunk[_id] = data;
    //                 }
                    
    //                 updatedChunk = JSON.stringify(parsedChunk);
    //             }
    //             catch(error){
    //                 return this._handleData(error,null);
    //             }
    //             callback(null,updatedChunk);
    //         },
    //         flush() {
    //             console.log('flush');
    //         }
    //     })
    //     return transformStream;
    // }

    // _readDatabaseFile(){
    //     const global = this;
    //     const readStream = fs.createReadStream(this.databasePath, { encoding: 'utf8' });
    //     let dataString = "";
    //     readStream.on('error',(error) =>{
    //         return this._handleData(error, null);
    //     })

    //     readStream.on('data', (chunk)=>{
    //         dataString += chunk;
    //     })

    //     const result = {};

    //     readStream.on('end',async ()=>{
    //         try {
    //             const jsonData = await JSON.parse(dataString);
    //             result = jsonData;
    //             // console.log("From readDB : \n"+JSON.stringify(jsonData['9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d']));
    //             // return this._handleData(null, jsonData);
    //         }
    //         catch(error){
    //             // return this._handleData(error, null);
    //             console.log(error)
    //         }
    //     })
    //     return result;
    // }

    // _generateId(){
    //     return uuidv4();
    // }

    // _uuidValidateV4(_uuid) {
    //     return uuidValidate(_uuid) && uuidVersion(_uuid) === 4;;
    // }

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