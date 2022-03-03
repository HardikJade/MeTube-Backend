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
                    
                    let song = await Song.create({
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
            catch(e){
                console.log(e)
                response.status(400).json({'error' : "Something Went Wrong!"});}
        }
}})
router.get('/song/stream',getDetails,(request,response)=>{
    const userid = request.user_id;
    if(userid){
        try{         
            let songId = request.body.song;
            if(songId){
                gfs.files.findOne({filename : request.body.song},(err,file)=>{
                    if(file === null || file.length === 0){response.status(400).json({"error" : "Invalid Request"});}
                    else{
                        try{
                            const range = (request.header.range) ? request.header.range : "0";
                            const size = file.length;
                            const start = Number(range.replace(/\D/g,""));
                            const end =  size - 1;
                            const contentLength = end - start + 1;
                            const header = {
                                'Content-Range' : `byte ${start}-${end}/${size}`,
                                'Accept-Ranges' : "bytes",
                                "Content-Length" : contentLength,
                                'Content-Type' : file.contentType
                            };
                            response.writeHead(206,header);
                            const stream = gridfsBucket.openDownloadStream(file._id);
                            stream.pipe(response);
                        }catch(e){response.status(400).json({"error" : "Invalid Request"});}
                    }
                })
            }
            else{response.status(400).json({"error" : "Invalid Request"});}   
        }
        catch(e){response.status(400).json({"error" : "Something Went Wrong!"})}
    }else{response.status(400).json({"error" : "Invalid Request"});}
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