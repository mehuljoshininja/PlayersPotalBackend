var mongoose = require('mongoose')
var Schema = mongoose.Schema

var playerSchema = new Schema({
    playername:{
        type: String,
        trim: true
    },
    borndate:{
        type: String,
        trim: true
    },
    role:{
        type: String,
        trim: true
    },
    batsman:{
        type: String,
        trim: true
    },
    bowler:{
        type: String,
        trim: true
    },
    team:{
        type: String,
        trim: true
    },
    profilephoto: {
        type: String,
        trim: true
    }
},{
    collection:'Players',
    timestamps:true
})

module.exports = mongoose.model('Players',playerSchema)