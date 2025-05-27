const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");//ye automaticALLY username aur pw define krdega

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
})

userSchema.plugin(passportLocalMongoose);              //username,salting,hashing & hash pw ..ye sab kuch ye khud krdeta hai

module.exports = mongoose.model('User', userSchema);
