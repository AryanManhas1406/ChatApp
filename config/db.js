const mongoose = require("mongoose");

const connectDB = async () =>{
    try {
   await mongoose.connect('mongodb://localhost:27017/chatapp');
   console.log("mongodb connected successfully");

    }
    catch(err){
        console.log(`There is some error while connecting with the Database,${err}`);
    }
}
module.exports = connectDB;