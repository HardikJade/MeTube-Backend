require('dotenv').config()
const express = require('express');
const cors = require('cors')
const connectDatabase = require('./db_connect');
const port = process.env.BACKEND_PORT
connectDatabase();
const app = express()
app.use(cors());
app.use(express.json())
//Linking Router with Main File
app.use('/api/authentication',require('./routes/Authenticate'));
app.use('/api/profile',require('./routes/ProfileHandler'));
app.use('/crucial',require('./routes/SongHandler'));
// app.get('/', (req, res) => {res.status(400).json({'Message' : "This is Invalid Entry!"})})
app.listen(port, () => {console.log(`Backend Running At Port ${port}`)})