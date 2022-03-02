const express = require('express');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const uploaderVerify = require('../middleware/UploaderAuth');
const songInserter = require('../middleware/SongDatabase');
const router = express.Router();
const conn = mongoose.connection;
let gfs = null;
let gridfsBucket = null;
conn.once('open',()=>{
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {bucketName: 'song'})
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('song');
})
router.post('/song',uploaderVerify,songInserter.single('song'),async (request,response)=>{
    response.status(200).json({'file' : request.file});
})
module.exports = router;