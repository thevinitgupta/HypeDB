import fs from "fs";
import  {v4 as uuidv4, version as uuidVersion , validate as uuidValidate } from "uuid"
import {Transform} from "stream";
import tmp from "tmp"
class HypeData{ 
  constructor(){}

  createCollection(collection, schema){
      this.databasePath = `./data/${collection}.json`;
      if(fs.existsSync(this.databasePath)===true){
          throw new Error("Collection already exists");
      }

      else{
        fs.writeFileSync(this.databasePath,JSON.stringify({
          schema,
          data : []
        }), {flag : 'wx'});
      }
  }
  
  getAll(){
    return this.#handleData(null,this.data);
  }

  get(_field, _value = null){
    if(!_field){
      return this.#handleData({
        code : 400,
        message : "Key not found"
      }, null);
    }
    if(!_value){
      return this.#handleData({
        code : 400,
        message : "Value not found"
      }, null);
    }
    if(_field==="_id" && !this.#uuidValidateV4(_value)){
      return this.#handleData({
        code : 400,
        message : "Invalid ID"
      })
    }
    if(_value===""){
      console.log("empty value")
      return this.getAll();
    }

    return this.#handleData(null,this.#searchByField(_field, _value));
  }

  create(_object){
    const _id = this.#generateId();
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
      return _object; 
    }
    catch(error){
      return error;
    }
    
  }

  update(_id, _field, _value){
    if(!this.#uuidValidateV4(_id)){
      return this.#handleData({
        code : 400,
        message : "Invalid ID"
      })
    }
    if(!_field){
      return this.#handleData({
        code : 400,
        message : "Key not found"
      }, null);
    }
    if(!_value || _value===[]){
      return this.#handleData({
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
      return this.#handleData(error, null);
    }

    return this.#handleData(null, updatedDoc);
    
  }

  deleteAll(){
    return this.#deleteData();
  }

  delete(_field, _value){
    if(!_field){
      return this.#handleData({
        code : 400,
        message : "Provide field to search"
      }, null);
    }
    if(_field && !_value){
      return this.#handleData({
        code : 400,
        message : "Provide value to match"
      }, null);
    }
    if(_field==="_id" && !this.#uuidValidateV4(_value)){
      return this.#handleData({
        code : 400,
        message : "Invalid ID provided"
      })
    }
    if(_value===""){
      return this.#deleteData();
    }

    return this.#deleteData(_field, _value);
  }

  #generateId(){
      return uuidv4();
  }

  #uuidValidateV4(_uuid) {
      return uuidValidate(_uuid) && uuidVersion(_uuid)===4;
  }

  #readDataFromFileSync(){
    this.data = JSON.parse(fs.readFileSync(this.databasePath,'utf8')).data;
    this.updatedData = this.data;
  }

  /*
    Asynchronously read the data from the database using readStream
  */
  readDataFromFile(collection){
    const _dbPath = `./data/${collection}.json`;
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

  #deleteData(_field=null, _value=null){
    const readStream = fs.createReadStream(this.databasePath);
    const tmpFile = tmp.fileSync({"postfix" : ".json"});
    const writeStream = fs.createWriteStream(tmpFile.name);
    const filePath = this.databasePath;
    const global = this;

    try{
      readStream.pipe(
      new Transform({
        transform(chunk,encoding,callback){
          const fileData = JSON.parse(chunk);
          fileData.data = global.#filterByField(fileData.data, _field, _value);
          this.updatedData = fileData.data;
          callback(null, JSON.stringify(fileData));
        }
      })
      ).pipe(writeStream)
      .on('finish', () =>{
          fs.copyFile(tmpFile.name, filePath, (err)=>{
            if(err){
              throw err;
            }
          })
          this.data = this.updatedData;
      });
    }
    catch(error){
      this.updatedData = this.data;
      return this.#handleData(error, null);
    }
    return this.#handleData(null, []);
  }

  #filterByField(_data,_field=null, _value=null){
    return _data.filter((doc) =>{
      if(_field==null || _value==null) return false;
      else if(doc[_field]!=undefined && doc[_field]==_value) return false;
      else return true;
    })
  }

  #searchByField(_field, _value){
    let searchData = [];
    this.data.forEach((item) =>{
      if(item[_field] && (_value!=null && item[_field]===_value)){
        searchData.push(item);
      }
    });
    return searchData;
  }

  #handleData(error, data){
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

export default HypeData;
