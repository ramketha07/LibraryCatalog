const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// 📌 Simple auth guard
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect("/login");
}

// 📌 Home & Search Books by Name
router.get("/", async (req, res) => {
    try {
        let books = [];
        if (req.query.name) {
            let query = { name: new RegExp(req.query.name, "i") };
            books = await Book.find(query);
        } else {
            // Show all books by default on home page
            books = await Book.find().sort({ name: 1 });
        }
        console.log(`Home route: Found ${books.length} books`);
        res.render("index", { books });
    } catch (err) {
        console.error("Home route error:", err);
        res.status(500).send("Server Error");
    }
});

// 📌 Browse All Books
router.get("/books", async (req, res) => {
    try {
        console.log("Books route accessed");
        let books = [];
        let searchQuery = "";
        
        if (req.query.search) {
            searchQuery = req.query.search;
            console.log(`Searching for: ${searchQuery}`);
            // Search across multiple fields
            const searchRegex = new RegExp(searchQuery, "i");
            books = await Book.find({
                $or: [
                    { name: searchRegex },
                    { author: searchRegex },
                    { floor: searchRegex },
                    { rack: searchRegex }
                ]
            });
        } else {
            console.log("Getting all books");
            // Get all books if no search query
            books = await Book.find().sort({ name: 1 });
        }
        
        console.log(`Books route: Found ${books.length} books`);
        res.render("books", { books, searchQuery });
    } catch (err) {
        console.error("Books route error:", err);
        res.status(500).send("Server Error");
    }
});

// 📌 Render Add Book Page (protected)
router.get("/add", requireAuth, (req, res) => {
    try {
        console.log("Add book page accessed");
        res.render("addBook");
    } catch (err) {
        console.error("Add book page error:", err);
        res.status(500).send("Server Error");
    }
});

// 📌 Add New Book (protected)
router.post("/add", requireAuth, async (req, res) => {
    const { name, author, floor, rack } = req.body;
    try {
        console.log(`Adding book: ${name} by ${author}`);
        const newBook = new Book({ name, author, floor, rack });
        await newBook.save();
        console.log("Book added successfully");
        res.redirect("/");
    } catch (err) {
        console.error("Add book error:", err);
        res.status(500).send("Error Adding Book");
    }
});

module.exports = router;
