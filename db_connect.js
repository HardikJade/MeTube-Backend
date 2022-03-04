const mongoose = require('mongoose');
require('dotenv').config();
const backendURL = process.env.mongoURL;
const connectDatabase = ()=>{return new Promise((resolve,reject)=>{try{mongoose.connect(backendURL,()=>{console.log('Connected to Database Successfully....')});resolve();}catch(e){reject()}})}    
module.exports = connectDatabase;