const express = require('express');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { header, body, validationResult } = require('express-validator');
const uploaderVerify = require('../middleware/UploaderAuth');
const songInserter = require('../middleware/SongDatabase');
const Song = require('../models/Song');
const getDetails = require('../middleware/GetDetails');
const router = express.Router();
const conn = mongoose.connection;
let gfs = null;

/**@type { mongoose.mongo.GridFSBucket }*/
let gridfsBucket = null;
conn.once('open',()=>{
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {bucketName: 'song'})
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('song');
})
router.post('/upload/song',uploaderVerify,[
    header('auth-token').isString().isLength({min : 1})
],songInserter.single('song'),async (request,response)=>{
    if(request.file === undefined){response.status(400).json({'error' : 'Invalid File'})}
    else{
        const validate = validationResult(request);
        if(!validate.isEmpty()){response.status(400).json({'error' : 'Validation Failed'})}
        else{
            try{
                if(request.file.id){
                    // request.file.mimetype
                    await Song.create({
                        name : request.body.name, 
                        album : request.body.album, 
                        genre : request.body.genre, 
                        thumbnail : request.body.thumbnail, 
                        artist : request.body.artist, 
                        releaseYear : request.body.year,
                        length : request.file.size,
                        uploader : request.uploader_id,
                        data : request.file.filename
                    });
                    response.status(200).json({'error' : 'Success'});
                }else{response.status(400).json({'error' : 'File Not Saved!'})}
            }
            catch(e){response.status(400).json({'error' : "Something Went Wrong!"});}}
        }})
// router.get('/song/stream',getDetails,(request,response)=>{
router.get('/song/stream/:song_name',(request,response)=>{
    // const userid = request.user_id;
    const userid = "dsa";
    if(userid){
        try {
            let songId = request.params.song_name;
            if(songId){
                gfs.files.findOne({filename : songId},async (err,file)=>{
                    if(file === null || file.length === 0){response.status(400).json({"error" : "Invalid Request"});}
                    else{
                        try{
                            if(request.headers.range) {
                                const parts = request.headers['range'].replace(/bytes=/, "").split("-");
                                const start = parseInt(parts[0], 10);
                                let end = Math.min((start + 10**6) , file.length);
                                const contentLength = (end - start);
                                let header = {
                                    'Accept-Ranges': 'bytes',
                                    'Content-Length': contentLength,
                                    'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
                                    'Content-Type': file.contentType,
                                    'Cache-Control': 'no-cache'
                                }
                                console.log(header)
                                if ((start === file.length - 1 )|| (contentLength === 0)) {
                                    response.end()
                                    return response.socket.end()
                                }
                                response.writeHead(206,header);
                                gridfsBucket.openDownloadStream(file._id,{start,end}).pipe(response);
                            }else{response.status(400).json({"error" : "Invalid Request"});}
                        } catch(e){response.status(400).json({"error" : "Invalid Request"});}
                    }
                })
            }
            else{response.status(400).json({"error" : "Invalid Request"});}   
        }
        catch(e){
            console.log(e);            
            response.status(400).json({"error" : "Something Went Wrong!"})
        }
    }else{response.status(400).json({"error5" : "Invalid Request"});}
})
router.get('/song/list',getDetails,[
    body('size').exists().notEmpty().isInt({min:1,max:20}),
    body('page').exists().notEmpty()
],async (request,response)=>{
    const validate = validationResult(request);
    if(!validate.isEmpty()){response.status(400).json({'error' : 'Invalid Headers'})}
    else{
        let pageNo = request.body.page - 1;
        let pageSize = request.body.size;
        try{
            await Song.find()
            .sort({'uploadDate' : -1})
            .select("-_id -uploader -thumbnail -uploadDate -__v")
            .exec((error,song)=>{
                song = song.slice(pageSize*pageNo , (pageSize*pageNo) + pageSize)
                response.status(200).json(song);
            })
        }
        catch(e){response.status(400).json({"error" : "Something Went Wrong"});}    
    }        
})
module.exports = router;