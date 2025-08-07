const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const fileModel = require('../models/fileModel');

// GET Login
router.get("/login", (req, res) => {
    res.render('login', { error: null });
});

// POST Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render("login", { error: "Invalid email or password" });
    }
    req.session.userId = user._id;
    res.redirect("/account");
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send("Error logging out");
        res.redirect("/login");
    });
});

// GET Signup
router.get("/signup", async (req, res) => {
    const files = await fileModel.find({});
    res.render("signup", { error: null, files });
});

// POST Signup
router.post("/signup", async (req, res) => {
    const { fname, lname, email, password } = req.body;
    const existUser = await userModel.findOne({ email });
    if (existUser) {
        return res.render("signup", { error: "User already exists", files: [] });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
        name: fname,
        surname: lname,
        email,
        password: hashedPassword
    });
    await user.save();
    req.session.userId = user._id;
    res.redirect("/account");
});

module.exports = router;
