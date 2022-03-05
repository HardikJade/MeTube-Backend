require('dotenv').config()
const express = require('express');
const connectDatabase = require('./db_connect');
const port = process.env.BACKEND_PORT
const app = express()
app.use(express.json())
connectDatabase().then(()=>{
    app.get('/',(request,response)=>{response.sendFile(__dirname + '/temp.html')})
    app.use('/api/authentication',require('./routes/Authenticate'));
    app.use('/api/profile',require('./routes/ProfileHandler'));
    app.use('/crucial',require('./routes/SongHandler'));
}).catch(()=>{console.log('Database Connection Failed')});
app.listen(port, () => {console.log(`Backend Running At http://localhost:${port}`)})