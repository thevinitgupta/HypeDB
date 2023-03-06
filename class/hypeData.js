const fs = require("fs");
const {v4 : uuidv4, version : uuidVersion , validate : uuidValidate } = require("uuid")
const {Transform} = require("stream");
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

  get(_key, _value = null){
    if(!_key){
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
    if(_key==="_id" && !this._uuidValidateV4(_value)){
      return this._handleData({
        code : 400,
        message : "Invalid Key"
      })
    }
    if(_value===""){
      return this.get();
    }

    return this._handleData(null,this._searchByField(_key, _value));
  }

  create(newUser){
    const _id = this._generateId();
    newUser._id = _id;

    this.data.push(newUser);
    this.updatedData.push(newUser);

    // TODO write the object to the file
    const filePath = this.databasePath;
    try{
      const readStream = fs.createReadStream(filePath);
      const writeStream = fs.createWriteStream("./data/User2.json");
    
      // const updateStream = ;
    
      readStream
      .pipe(
        new Transform({
          transform(chunk, encoding, callback) {
            let cData = JSON.parse(chunk);
            console.log("CData : ");
            cData.data.forEach((d)=> {console.log(JSON.stringify(d))})
            cData.data.push(newUser);
            console.log(">>>>> chunk : ",chunk.toString());
            // this.push(JSON.stringify(data));
            callback(null, JSON.stringify(cData));
          },
        })
      )
      .pipe(writeStream);
      return this._handleData(null, newUser);
    }
    catch(error){
      return this._handleData(error, null);
    }
    
  }

  _generateId(){
      return uuidv4();
  }

  _uuidValidateV4(_uuid) {
      return uuidValidate(_uuid) && uuidVersion(_uuid)===4;
  }

  _createAddStream(_obj){
    
    return transform;
  }

  _createUpdateStream(_id, _field, _value){
    const transform = new Transform({
      transform(chunk, encoding, callback){
        let fileData = JSON.parse(chunk);
        fileData.data = fileData.data.map((_doc, _index) => {
          if(_doc._id===_id){
            _doc = {..._doc, _field : _value};
          }
          return _doc;
        });

        this.push(JSON.stringify(fileData));
        callback();
      }
    })

    return transform;
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

  _searchByField(_field, _value){
    let searchData = [];
    this.data.forEach((item) =>{
      if(item[_field] && (_value!=null || item[_field]===_value)){
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