const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    createdBy : {
        type : String,
        required : true
    },
    members : [
        {
            type : String,
            required  : true
        }
    ],
    isActive : {
        type : Boolean,
        default : true
    },
    lastMessage : {
        text : {type : String,default : ""},
        sender : {type : String,default : ""},
        timeStamp : {type : Date,default : Date.now}
    },
    createdAt : {type : Date,default : Date.now}
});                              
module.exports = mongoose.model("Room", roomSchema)