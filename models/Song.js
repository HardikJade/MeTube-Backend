const mongoose = require('mongoose');
const { Schema } = mongoose;
const SongSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    artist:  {
        type: String,
        default : 'Unknown'
    },
    uploadDate:  {
        type: Date,
        default:Date.now
    },
    releaseYear:  {
        type: String
    },
    album : {
        type:String,
        default: ""
    },
    genre : {
        type:String,
        default: ""
    },
    thumbnail : {
        type : String,
        default: ""
    },
    length :{
        type : Number,
        required : true
    },
    uploader :{
        type: mongoose.Schema.Types.ObjectId,
        ref : "users",
        required: true
    },
    data: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "song.files",
        required: true,
        default : null
    }
});
const Song = mongoose.model('Song',SongSchema);
Song.createIndexes();
module.exports = Song;