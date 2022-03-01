const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserSchema = new Schema({
    fname:  {
        type: String,
        required: true
    },
    lname:  {
        type: String,
        required: true
    },
    email:  {
        type: String,
        required: true,
        unique:true
    },
    password:  {
        type: String,
        required: true
    },
    profile : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "profileImage.files",
        required: false,
        default : null
    },
    date:  {
        type: Date,
        default:Date.now
    }
});
const User = mongoose.model('User',UserSchema);
User.createIndexes();
module.exports = User;