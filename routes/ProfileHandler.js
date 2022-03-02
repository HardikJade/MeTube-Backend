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
            if(updateUser.profile){updateUser.profile = fileid;}
            await User.findByIdAndUpdate(userid , {$set : updateUser},{new : true})
            response.status(200).json({"path" : fileid});
        }else{response.status(400).json({"error" : "Something Went Wrong!"})}
    }else{response.status(400).json({"error" : "File Not Found!"})}
})
router.get('/get-profile',getDetails,async (request,response)=>{
    let userid = request.user_id
    if(userid){
        let user = await User.findById(userid);
        let profileid = user.profile;
        gfs.files.findOne({_id : profileid},(err,file)=>{
            var readstream = gridfsBucket.openDownloadStream(profileid);
            response.setHeader('Content-Type', file.contentType)
            readstream.pipe(response);
        })
    }else{response.status(400).json({"error" : "User Not Found!"})}
})
module.exports = router;