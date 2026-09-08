const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;