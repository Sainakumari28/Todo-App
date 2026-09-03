const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema ({
   task : {
    type: String,
    },
    complete: {
     type: Boolean,
    },
});

const Todo = mongoose.model("Todo", TodoSchema);

 module.exports = Todo;