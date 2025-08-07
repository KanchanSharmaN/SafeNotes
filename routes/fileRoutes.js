const express = require('express');
const router = express.Router();
const fileModel = require('../models/fileModel');
const upload = require('../middleware/uploadMiddleware');

function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    return res.redirect("/signup");
}

// Create file
router.get("/create", isAuthenticated, (req, res) => {
    res.render("create");
});

// CREATE - Handle file upload
router.post("/create", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        // S3 file URL
        const fileUrl = req.file.location;

        const newFile = new fileModel({
            filename: req.body.filename,
            description: req.body.description,
            date: req.body.date,
            userId: req.session.userId,
            fileUrl: fileUrl // ✅ S3 URL stored
        });

        await newFile.save();
        res.redirect("/account");

    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).send("Upload failed: " + err.message);
    }
});

// Edit file
router.get("/edit/:id", isAuthenticated, async (req, res) => {
    const file = await fileModel.findById(req.params.id);
    if (!file || file.userId.toString() !== req.session.userId) return res.send("Unauthorized");
    res.render("edit", {
        id: file._id,
        filename: file.filename,
        description: file.description
    });
});

router.post("/update/:id", isAuthenticated, async (req, res) => {
    const file = await fileModel.findById(req.params.id);
    if (!file || file.userId.toString() !== req.session.userId) return res.send("Unauthorized");
    await fileModel.findByIdAndUpdate(req.params.id, { description: req.body.description });
    res.redirect("/account");
});

// Delete file
router.get("/delete/:id", isAuthenticated, async (req, res) => {
    const file = await fileModel.findById(req.params.id);
    if (!file || file.userId.toString() !== req.session.userId) return res.send("Unauthorized");
    await fileModel.findByIdAndDelete(req.params.id);
    res.redirect("/account");
});

// Show file
router.get("/show/:id", async (req, res) => {
    const file = await fileModel.findById(req.params.id);
    res.render("show", { data: file.description, filename: file.filename, id: file._id });
});

module.exports = router;
