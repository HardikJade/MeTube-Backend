const mongoose = require('mongoose');
require('dotenv').config();
const backendURL = process.env.mongoURL;
const connectDatabase = ()=>{
    mongoose.connect(backendURL,()=>{console.log('Connected to Database Successfully....')});
}
module.exports = connectDatabase;