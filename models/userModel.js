const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    Name:{
        type:String,
        require:true
    },
    surname:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
})

module.exports = mongoose.model("user",userSchema);