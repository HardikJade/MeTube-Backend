const mongoose = require('mongoose');
const { Schema } = mongoose;
const SongSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    author:  {
        type: Array,
        required: true
    },
    uploadDate:  {
        type: Date,
        default:Date.now
    },
    releaseYear:  {
        type: String,
    },
    thumbnail : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "profileImage.files",
        required: false,
    },
    length :{
        tyoe : Number,
        required : true
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