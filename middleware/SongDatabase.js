const path = require('path');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const multer = require('multer');
const crypto = require('crypto');
const maxSize = 10 * 1024 * 1024; // for 10MB
const fileTypes = ['audio/mpeg'];
const storage = new GridFsStorage({
  url: process.env.mongoURL,
  file: (request,file)=>{
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {return reject(err);}
        else{
          const filename = buf.toString('hex');
          const fileInfo = {
            filename: filename,
            bucketName: 'song'
          };
          if(fileTypes.includes(file.mimetype)){resolve(fileInfo)}
          else{reject(err)}
        }
      });
    });
  }
})  
const songInserter = multer({storage : storage});
module.exports = songInserter;