const fs = require("fs");
const {v4 : uuidv4, version : uuidVersion , validate : uuidValidate } = require("uuid")
const {Transform} = require("stream");
const tmp = require("tmp")
class HypeData{ 
  constructor(_dbName){
      this.databaseName = _dbName;
      this.databasePath = `./data/${this.databaseName}.json`;
      this.data = [];
      this.updatedData = [];
      try{
          //create an empty file
          if(fs.existsSync(this.databasePath)==false){
              fs.writeFileSync(this.databasePath,JSON.stringify({}), {flag : 'wx'});
          }

          else{
            // database exists -> read the file
            this._readDataFromFileSync();
            console.log(this.data,"\n",this.updatedData);
          }
      }
      catch(error){
          return this._handleData(error, null);
      }
  }
  
  getAll(){
    return this._handleData(null,this.data);
  }

  get(_field, _value = null){
    if(!_field){
      return this._handleData({
        code : 400,
        message : "Key not found"
      }, null);
    }
    if(!_value){
      return this._handleData({
        code : 400,
        message : "Value not found"
      }, null);
    }
    if(_field==="_id" && !this._uuidValidateV4(_value)){
      return this._handleData({
        code : 400,
        message : "Invalid ID"
      })
    }
    if(_value===""){
      console.log("empty value")
      return this.getAll();
    }

    return this._handleData(null,this._searchByField(_field, _value));
  }

  create(_object){
    const _id = this._generateId();
    _object._id = _id;

    this.data.push(_object);
    this.updatedData.push(_object);

    //* write the object to the file
    const filePath = this.databasePath;
    try{
      const readStream = fs.createReadStream(filePath);
      const tmpFile = tmp.fileSync({postfix : ".json"});
      const writeStream = fs.createWriteStream(tmpFile.name);
          
      readStream
      .pipe(
        new Transform({
          transform(chunk, encoding, callback) {
            let cData = JSON.parse(chunk);
            cData.data.push(_object);
            // console.log(">>>>> chunk : ",chunk.toString());
            callback(null, JSON.stringify(cData));
          },
        })
      )
      .pipe(writeStream)
      .on('finish', () =>{
        return fs.copyFile(tmpFile.name, filePath, (err) =>{
          if(err) {
            throw err;
          }
        })
      });
      return this._handleData(null, _object); 
    }
    catch(error){
      return this._handleData(error, null);
    }
    
  }

  update(_id, _field, _value){
    if(!this._uuidValidateV4(_id)){
      return this._handleData({
        code : 400,
        message : "Invalid ID"
      })
    }
    if(!_field){
      return this._handleData({
        code : 400,
        message : "Key not found"
      }, null);
    }
    if(!_value || _value===[]){
      return this._handleData({
        code : 400,
        message : "Value not found"
      }, null);
    }

    let updatedDoc = {};

    for (let i = 0; i < this.data.length; i++) {
      const obj = this.data[i];
      if (obj._id === _id) {
        this.updatedData[i] = {
          ...obj,
          [_field] : _value
        };
        updatedDoc = this.updatedData[i];
        break;
      }
    }

    const readStream = fs.createReadStream(this.databasePath);
    const tmpFile = tmp.fileSync({'postfix' : '.json'});
    const writeStream = fs.createWriteStream(tmpFile.name);
    const filePath = this.databasePath;

    try{
      readStream.pipe(
        new Transform({
          transform(chunk, encoding, callback){
            let fileData = JSON.parse(chunk);
            fileData.data = fileData.data.map((_doc, _index) => {
              let updatedDoc = _doc;
              if(_doc._id===_id){
                updatedDoc = {..._doc,[ _field] : _value};
              }
              return updatedDoc;
            });
    
            callback(null,JSON.stringify(fileData));
          }
        })
      ).pipe(writeStream).on('finish', () =>{
        return fs.copyFile(tmpFile.name, filePath, (err) =>{
          if(err) {
            throw err;
          }
        })
      });
      this.data = this.updatedData;
    }
    catch(error){
      // undo the changes in the local copy
      this.updatedData = this.data;
      return this._handleData(error, null);
    }

    return this._handleData(null, updatedDoc);
    
  }

  deleteAll(){

  }

  delete(_field, _value){
    if(!_field){
      return this._handleData({
        code : 400,
        message : "Provide field to search"
      }, null);
    }
    if(!_value){
      return this._handleData({
        code : 400,
        message : "Provide value to match"
      }, null);
    }
    if(_field==="_id" && !this._uuidValidateV4(_value)){
      return this._handleData({
        code : 400,
        message : "Invalid ID provided"
      })
    }
    if(_value===""){
      console.log("empty value to delete")
      
    }
  }

  _generateId(){
      return uuidv4();
  }

  _uuidValidateV4(_uuid) {
      return uuidValidate(_uuid) && uuidVersion(_uuid)===4;
  }

  _readDataFromFileSync(){
    this.data = JSON.parse(fs.readFileSync(this.databasePath,'utf8')).data;
    this.updatedData = this.data;
  }

  /*
    Asynchronously read the data from the database using readStream
  */
  _readDataFromFile(){
    const _dbPath = this.databasePath;
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(_dbPath,'utf8');
      let fileData = '';
      readStream.on('data', (chunk) =>{
        fileData += chunk;
      })

      readStream.on('error', (error) =>{
        reject(error);
      })

      readStream.on('end', () =>{
        const parsedData = JSON.parse(fileData);
        resolve(parsedData.data);
      })
    })
  }

  _deleteData(_field=null, _value=null){
    const readStream = fs.createReadStream(this.databasePath);
    const tmpFile = tmp.fileSync({"postfix" : ".json"});
    const writeStream = fs.createWriteStream(tmpFile.name);
    const filePath = this.databasePath;

    readStream.pipe(
      new Transform({
        transform(chunk,encoding,callback){
          const fileData = JSON.parse(chunk);
          fileData.data = this._filterByField(fileData.data, _field, _value);
          this.updatedData = fileData.data;
          callback(null, fileData);
        }
      })
    ).pipe(writeStream)
    .on('finish', () =>{
      try{
        fs.copyFile(tmpFile.name, filePath, (err)=>{
          if(err){
            throw err;
          }
        })
        this.data = this.updatedData;
      }
      catch(error){
        this.updatedData = this.data;
        return this._handleData(error, null);
      }
    });
    return this._handleData(null, []);
  }

  _filterByField(_data,_field=null, _value=null){
    _data.filter((doc) =>{
      if(_field==null || _value==null) return -1;
      else if(doc[_field]!=undefined && doc[_field]==_value) return -1;
      return 1;
    })
    return _data;
  }

  _searchByField(_field, _value){
    let searchData = [];
    this.data.forEach((item) =>{
      if(item[_field] && (_value!=null && item[_field]===_value)){
        searchData.push(item);
      }
    });
    return searchData;
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