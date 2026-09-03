require("dotenv").config(); // 

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Todo = require("./models/todo");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");

mongoose.connect(process.env.ATLASDB_URL)
 .then(() => {
  console.log("connected to mongoDB Atlas");
 }) 
  .catch((err) => {
    console.log(err);
  });

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(methodOverride("_method"));
  app.use(express.urlencoded({extended: true }));
  app.use(express.static("public"));

// flash
  app.use(session({
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true
}));

  app.use(flash());

  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

 // New Route
 app.post("/todo", async (req, res) => {
  let task = new Todo ({
   task: (req.body.task)
  });
  await task.save();
   req.flash("success", "New Task Created!");
  res.redirect("/todo");
 });

//Edit 1st Index Route
 app.get("/todo", async (req, res) => {
  const todos = await Todo.find({});
  res.render("index.ejs", { todos, editTodo: null });
 });

  //Edit Route
  app.get("/todo/:id/edit", async (req, res) => {
    let { id } = req.params;
    const editTodo = await Todo.findById(id);
    const todos = await Todo.find({}); 
    res.render("index.ejs", {todos, editTodo});
  });


  //Delete Route
  app.delete("/todo/:id", async (req,res) => {
    const { id } = req.params;
    let deletedTodo = await Todo.findByIdAndDelete(id);
    console.log(deletedTodo);
    req.flash("success", "Task was deleted!");
    res.redirect("/todo");
});

//Update
  app.put("/todo/:id", async(req, res) => {
    let { id } = req.params;
 
    console.log(req.body);
    if(req.body.complete !== undefined) {
       
    let complete = Array.isArray(req.body.complete)
       ? req.body.complete.includes("true")
       : req.body.complete === "true";

    await Todo.findByIdAndUpdate(id, {
    complete: complete
    });
      } else {
       await Todo.findByIdAndUpdate(id, {
       task: req.body.task
      });
    }
    req.flash("success", "Updated!");
     res.redirect("/todo");  
 });

 
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});