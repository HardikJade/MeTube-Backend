const path = require('path');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const multer = require('multer');
const crypto = require('crypto');
const storage = new GridFsStorage({
  url: process.env.mongoURL,
  file: (request,file) => {
      return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {return reject(err);}
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'profileImage'
        };
        resolve(fileInfo);
      });
    });
  }
})
const profilePic = multer({ storage });
module.exports = profilePic;
