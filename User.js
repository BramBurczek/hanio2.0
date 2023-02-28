const mongoose = require("mongoose")

const userSchema =  mongoose.Schema({
    id: String,
    name: String,
    email: String,
    password: String,
    score: Number
})

module.exports = mongoose.model("User",userSchema)