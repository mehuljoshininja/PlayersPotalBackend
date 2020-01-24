var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = new Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    profilephoto:{
        type:String,
        trim:true
    },
    role: {
        type: String,
        default: 'user'
    }
},{
    collection:'Users',
    timestamps:true
})

module.exports = mongoose.model('Users',userSchema)