require("dotenv").config(); // 

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Todo = require("./models/todo");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const User = require("./models/user");
const ejsMate = require("ejs-mate");
const bcrypt = require("bcrypt");

mongoose.connect(process.env.ATLASDB_URL)
 .then(() => {
  console.log("connected to mongoDB Atlas");
 }) 
  .catch((err) => {
    console.log(err);
  });

  app.engine("ejs", ejsMate);
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(methodOverride("_method"));
  app.use(express.urlencoded({extended: true }));
  app.use(express.static("public"));

  app.use(session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false
  }));

// flash
  app.use(flash());

  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

function isLoggedIn(req, res, next) {
  if(!req.session.userId) {
    return res.redirect("/login");
  }
  next();
}

//Home 
app.get("/", (req, res) => {
  res.redirect("/signup");
});

//Signup 
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", async(req, res) => {
 try {
   const { email, username, password } = req.body;
   const existingEmail = await User.findOne({ email: email });
   
   if(existingEmail) {
    req.flash("error", "Email already exists!");
    return res.redirect("/signup");
   }
    const hashedPassword = await bcrypt.hash( password, 10);

    const user = new User({
      email: email,
      username: username,
      password: hashedPassword
    });

    await user.save();

    req.session.userId = user._id;

    req.flash("success", "Account created successfully!");
    res.redirect("/todo");

    } catch (err) {
      console.log("SIGNUP ERROR: ", err);
      req.flash("error", "Something went wrong!");
      res.redirect("/signup");
    }
  });

   

 //login
 app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async(req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
   console.log("Found User: ", user);             
  if(!user) {
    req.flash("error", "User not found");
    return res.redirect("/login");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
    req.flash("error", "Wrong Password");
    return res.redirect("/login");
  }
  req.session.userId = user._id;
  req.flash("success", "Login is Successful");
  res.redirect("/todo");
});


 // New Route
 app.post("/todo", async (req, res) => {
  let task = new Todo ({
   task: req.body.task,
   created_at: new Date(),
   user: req.session.userId
  });

  await task.save();
   req.flash("success", "New Task Created!");
  res.redirect("/todo");
 });

// Index
 app.get("/todo", isLoggedIn, async (req, res) => {
  const todos = await Todo.find({
   user: req.session.userId
 });
  const user = await User.findById(req.session.userId); 
  res.render("index.ejs", { todos, user, editTodo: null });
});

  //Edit Route
  app.get("/todo/:id/edit", isLoggedIn, async (req, res) => {
    let { id } = req.params;
    const editTodo = await Todo.findOne({
      _id: id,
       user: req.session.userId
    });
    const todos = await Todo.find({
      user: req.session.userId
    });

    const user = await User.findById(req.session.userId);
    res.render("index.ejs", {todos, user, editTodo});
  });


  //Delete Route
  app.delete("/todo/:id", isLoggedIn, async (req,res) => {
    const { id } = req.params;
    let deletedTodo = await Todo.findOneAndDelete({
      _id: id,
      user: req.session.userId
    });
    console.log(deletedTodo);
    req.flash("success", "Task was deleted!");
    res.redirect("/todo");
});

//Update
  app.put("/todo/:id", isLoggedIn, async(req, res) => {
    let { id } = req.params;
 
    console.log(req.body);
    if(req.body.complete !== undefined) {
       
    let complete = Array.isArray(req.body.complete)
       ? req.body.complete.includes("true")
       : req.body.complete === "true";

    await Todo.findOneAndUpdate(
      {
        _id: id,
        user: req.session.userId
      },
      {
        complete: complete
    });
      } else {
       await Todo.findOneAndUpdate(
        {
          _id: id,
          user: req.session.userId
        },
       {
         task: req.body.task
      });
    }
    req.flash("success", "Updated!");
     res.redirect("/todo");  
 });

 //Logout
 app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if(err) {
      return res.send("Logout failed");
    }
    res.redirect("/login");
  });
 });

 mongoose.connection.once("open", async() => {
     console.log("DATABASE:", mongoose.connection.name);
 });
 
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});