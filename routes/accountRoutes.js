const express = require('express');
const router = express.Router();
const fileModel = require('../models/fileModel');

function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    return res.redirect("/signup");
}

// Root
router.get("/", (req, res) => {
    if (req.session.userId) return res.redirect("/account");
    res.redirect("/login");
});

// Account
router.get("/account", isAuthenticated, async (req, res) => {
    const files = await fileModel.find({ userId: req.session.userId });
    res.render("account", { files });
});

module.exports = router;
