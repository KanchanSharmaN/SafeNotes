const express = require('express');
const app = express();
// const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mongoose = require("./config/mongoose");
mongoose();
const fileModel = require('./models/fileModel');
const userModel = require("./models/userModel");
const session = require('express-session');
const bcrypt = require('bcrypt');


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");



app.use(session({
    secret:process.env.SECRETKEY,
    resave:false,
    saveUninitialized:false,
    cookie: {
        secure: false
    }
}));

//middleware to protect / account route
function isAuthenticated(req,res,next){
    if(req.session.userId) return next();
    return res.redirect("/signup");
}

app.get("/",async (req,res)=>{
    try{
       if(req.session.userId) return res.redirect("/account");
       return res.redirect("/login");
    }catch(err){
        res.send(err);
    }
    
})

app.get("/login" , (req,res)=>{
    res.render('login',{error:null});
})
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render("login", {
                error: "Invalid email or password"
            });
        }

        // Store user ID in session and redirect
        req.session.userId = user._id;
        res.redirect("/account");

    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Logout error:", err);
            return res.status(500).send("Error logging out");
        }
        res.redirect('/login');
    });
});


app.get("/signup" ,async  (req,res)=>{
    const files = await fileModel.find({});
    res.render('signup',{error:null,files});
})

app.post("/signup",async (req,res)=>{
    try{
        const { fname, lname, email, password } = req.body;
        const existUser = await userModel.findOne({email});
        if(existUser){
            const files = await fileModel.find({});
            return res.render("signup",{error:"User already exist with this email."})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name:fname,
            surname:lname,
            email:email,
            password:hashedPassword
        });
        await user.save();
        req.session.userId = user._id;
        return res.redirect("/account");

    }catch(err){
        res.send(err)
        return res.status(500).render("signup", { error: "Internal server error. Please try again." });
    }
    
    
})
app.get("/account",isAuthenticated, async ( req,res)=>{
    const files = await fileModel.find({userId : req.session.userId});
    res.render("account",{files});
})



app.get("/create",isAuthenticated,(req,res)=>{
    res.render('create');
})
app.post("/create",isAuthenticated,async (req,res)=>{
    try{
         const newFile = new fileModel ({
            filename: req.body.filename,
            description: req.body.description,
            date : req.body.date,
            userId: req.session.userId
         });
         await newFile.save();
         res.redirect("/account");
    }catch(err){
        res.send(err);
    }
})

app.get("/edit/:id", async (req, res) => {
    try {
        const file = await fileModel.findById(req.params.id);
        if (!file) return res.send("File not found");
        if (file.userId.toString() !== req.session.userId) return res.send("Unauthorized");
        res.render("edit", {
            id: file._id,            
            filename: file.filename,
            description: file.description
        });
    } catch (err) {
        res.send(err);
    }
});




app.post("/update/:id", isAuthenticated, async (req, res) => {
    try {
        const file = await fileModel.findById(req.params.id);

        if (!file) return res.send("File not found");

        // Ensure that the logged-in user is the one trying to edit the file
        if (file.userId.toString() !== req.session.userId) return res.send("Unauthorized");

        // Correct the field name to 'description'
        const updatedFile = await fileModel.findByIdAndUpdate(req.params.id, {
            description: req.body.description  // Use 'description' as the field name
        }, { new: true });

        res.redirect("/account");  // Redirect after successful update
    } catch (err) {
        console.log("Error updating file:", err);  // Log errors for debugging
        res.send("Error updating file: " + err);  // Return error to the user
    }
});




app.get("/delete/:id", async(req,res)=>{
    try{
        const file = await fileModel.findById(req.params.id);
        if (file.userId.toString() !== req.session.userId) return res.send("Unauthorized");
        await fileModel.findByIdAndDelete(req.params.id)
        res.redirect("/account");
    }catch(err){
        res.send(err);
    }

})

app.get("/show/:id", async (req,res)=>{
    try{
        const file = await fileModel.findById(req.params.id)
        res.render("show",{data: file.description, filename:file.filename, id :file._id});
    }catch(err){
        res.send(err);
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});