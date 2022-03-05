const getDetails = require('../middleware/GetDetails');
const profilePic = require('../middleware/ProfileImage');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/Users');
const Grid = require('gridfs-stream');
const router = express.Router();
const conn = mongoose.connection;
let gfs = null;
let gridfsBucket = null;
conn.once('open',()=>{
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {bucketName: 'profileImage'})
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('profileImage');
})
router.put('/upload/avatar',getDetails,profilePic.single('profile'),async (request,response)=>{
    if(request.file){
        const fileid = request.file.id;
        const userid = request.user_id;
        let user = await User.findById(userid);
        if(user && userid !== undefined && fileid !== undefined){
            let updateUser = {};
            if(updateUser.fname){updateUser.fname = user.fname;}
            if(updateUser.lname){updateUser.lname = user.lname;}
            if(updateUser.email){updateUser.email = user.email;}
            if(updateUser.password){updateUser.password = user.password;}
            if(updateUser.date){updateUser.date = user.date;}
            updateUser.profile = request.file.filename
            await User.findByIdAndUpdate(userid , {$set : updateUser},{new : true})
            response.status(200).json({"path" : request.file.filename});
        }else{response.status(400).json({"error" : "Something Went Wrong!"})}
    }else{response.status(400).json({"error" : "File Not Found!"})}
})
router.get('/get-profile',getDetails,async (request,response)=>{
    let userid = request.user_id
    if(userid){
        try{
            let user = await User.findById(userid);
            let profile = user.profile;
            gfs.files.findOne({filename : profile},(err,file)=>{
                if(file === null || file.length === 0){response.status(400).send(null)}
                else{
                    var readstream = gridfsBucket.openDownloadStream(file._id);
                    const header = {'Content-Type' : file.contentType}
                    response.writeHead(200,header);
                    readstream.pipe(response);
                }
            })
        }catch(e){response.status(400).json({"error" : "Something Went Wrong!"})}
    }else{response.status(400).json({"error" : "User Not Found!"})}
})
module.exports = router;