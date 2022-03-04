require('dotenv').config()
const express = require('express');
const cors = require('cors')
const connectDatabase = require('./db_connect');
const port = process.env.BACKEND_PORT
const mongoose = require('mongoose');
const { request } = require('express');
const conn = mongoose.connection;
const app = express()
// app.use(cors());
app.use(express.json())
connectDatabase().then(()=>{
    app.get('/',(request,response)=>{response.sendFile(__dirname + '/temp.html')})
    app.use('/api/authentication',require('./routes/Authenticate'));
    app.use('/api/profile',require('./routes/ProfileHandler'));
    app.use('/crucial',require('./routes/SongHandler'));
}).catch(()=>{console.log('Database Connection Failed')});
app.listen(port, () => {console.log(`Backend Running At http://localhost:${port}`)})