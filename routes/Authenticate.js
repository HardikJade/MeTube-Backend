const express = require('express');
const Users = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const getDetails = require('../middleware/GetDetails');
require('dotenv').config();


const multer = require('multer');
const upload = multer({dest : "tmp/"});
const profilePic = require('../middleware/ProfileImage');
const User = require('../models/Users');
router.put('/upload/avatar',getDetails,profilePic.single('profile'),async (request,response)=>{
    const userid = request.user_id;
    const fileid = request.file.id;
    let user = User.findById(userid);
    if(user && userid !== undefined && fileid !== undefined){
        let updateUser = {};
        if(updateUser.fname){updateUser.fname = user.fname;}
        if(updateUser.lname){updateUser.lname = user.lname;}
        if(updateUser.email){updateUser.email = user.email;}
        if(updateUser.password){updateUser.password = user.password;}
        if(updateUser.date){updateUser.date = user.date;}
        if(updateUser.profile){updateUser.profile = fileid;}
        await User.findByIdAndUpdate(userid , {$set : updateUser},{new : true})
        response.status(200).json({"error" : "Success!"});
    }else{response.status(400).json({"error" : "Something Went Wrong!"})}
})

router.post('/sign-up',[
        body('fname','Enter A Valid First Name').isString().isLength({min:3,max : 20}),
        body('lname',"Enter A Valid Last Name").isString().isLength({min:3,max : 20}),
        body('email',"Enter A Valid Email").notEmpty().isEmail(),
        body('password',"Enter A Valid Password").isString().isLength({min:6,max:20})
    ],async (request,response)=>{
        const error = validationResult(request);
        if(!error.isEmpty()){response.status(400).json( {'error' : error })}
        else{
            try{
                let user = await Users.findOne({email : request.body.email})
                if(user){response.status(400).json({'error' : 'User Already Exist!'})} 
                else{
                    const salt = await bcrypt.genSalt(10);                    
                    let securePassword = await bcrypt.hash(request.body.password,salt);
                    user = await Users.create({
                        fname : request.body.fname,
                        lname : request.body.lname,
                        email : request.body.email,
                        password : securePassword
                    })
                    const secureToken = process.env.TOKEN_SECRET
                    const data = {'data' : {'key' : user.id}}
                    const finalPackage = jwt.sign(data, secureToken);
                    response.status(200).json({'auth' : finalPackage})
                }
            }catch(e){response.status(400).json({'error' : "Something Went Wrong!"})}
        }
    }
)
router.post('/login',[
        body('email',"Enter A Valid Email").notEmpty().isEmail(),
        body('password',"Enter A Valid Password").isString().isLength({min:6,max:20})
    ],async (request,response)=>{
    const error = validationResult(request);
    if(!error.isEmpty()){response.status(400).json( {'error' : "Validation Failed"})}
    else{
        try{
            let user = await Users.findOne({email : request.body.email});
            if(!user){response.status(400).json({'error' : 'User Not Exist!'})}
            else{
                    const validatePassword = await bcrypt.compare(request.body.password,user.password);
                    if(!validatePassword){response.status(400).json({'error' : 'Invalid Credentials!'})}
                    else{
                        const secureToken = process.env.TOKEN_SECRET
                        const data = {'data' : {'key' : user.id}}
                        const finalPackage = jwt.sign(data, secureToken);
                        response.status(200).json({'auth' : finalPackage})
                    }
                }
        }
        catch(e){response.status(400).json({'error' : "Something Went Wrong!"})}
    }
})
router.get('/get-details',getDetails,async (request,response)=>{
    try{
        const user_id = request.user_id;
        const user = await Users.findById(user_id).select("-password -_id -__v -date");
        response.status(200).json(user);
    }
    catch(e){response.status(400).json({'error' : "Something Went Wrong!"})}
})
module.exports = router;