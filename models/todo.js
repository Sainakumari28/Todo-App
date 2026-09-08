const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema ({
   task : {
    type: String,
    required: true
    },
    complete: {
     type: Boolean,
     default: false
    },
    created_at: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

const Todo = mongoose.model("Todo", TodoSchema);

 module.exports = Todo;