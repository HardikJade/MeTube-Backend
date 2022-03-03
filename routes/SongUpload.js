const express = require('express');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { header, body, validationResult } = require('express-validator');
const uploaderVerify = require('../middleware/UploaderAuth');
const songInserter = require('../middleware/SongDatabase');
const Song = require('../models/Song');
const router = express.Router();
const conn = mongoose.connection;
let gfs = null;
let gridfsBucket = null;
conn.once('open',()=>{
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {bucketName: 'song'})
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('song');
})
router.post('/song',uploaderVerify,[
    header('auth-token').isString().isLength({min : 1})
],songInserter.single('song'),async (request,response)=>{
    if(request.file === undefined){response.status(400).json({'error' : 'Invalid File'})}
    else{
        const validate = validationResult(request);
        if(!validate.isEmpty()){response.status(400).json({'error' : 'Validation Failed'})}
        else{
            try{
                if(request.file.id){
                    let song = await Song.create({
                        name : request.body.name, 
                        album : request.body.album, 
                        genre : request.body.genre, 
                        thumbnail : request.body.thumbnail, 
                        artist : request.body.artist, 
                        releaseYear : request.body.year,
                        length : 100,
                        uploader : request.uploader_id,
                        data : request.file.id
                    });
                    response.status(200).json({'error' : 'Success'});
                }else{response.status(400).json({'error' : 'File Not Saved!'})}
            }
            catch(e){response.status(400).json({'error' : "Something Went Wrong!"});}
        }
}})
module.exports = router;