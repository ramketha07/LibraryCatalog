const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");
const bookRoutes = require("./routes/bookRoutes");

require("dotenv").config();
const app = express();

// 📌 Connect to Database
connectDB();

// 📌 Middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

// 📌 Sessions for simple auth
app.use(
    session({
        secret: process.env.SESSION_SECRET || "college-library-secret",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 hours
    })
);

// 📌 Expose user to views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.error = null;
    next();
});

// 📌 Seed admins on startup
async function ensureSeedAdmins() {
    const seed = [
        { email: "ramketha07@gmail.com", password: "Ram123" },
        { email: "krishketha1@gmail.com", password: "Ram123" }
    ];
    for (const a of seed) {
        const exists = await Admin.findOne({ email: a.email });
        if (!exists) {
            await Admin.create(a);
        }
    }
}

// Kick off seeding after DB connects
(async () => {
    try {
        await ensureSeedAdmins();
        console.log("✅ Admin accounts ensured");
    } catch (e) {
        console.error("⚠️ Failed to ensure admin accounts:", e.message);
    }
})();

app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email, password });
        if (!admin) {
            return res.status(401).render("login", { error: "Invalid credentials" });
        }
        req.session.user = { email: admin.email };
        res.redirect("/add");
    } catch (e) {
        console.error("Login error:", e.message);
        res.status(500).render("login", { error: "Server error. Please try again." });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// 📌 Routes
app.use("/", bookRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port http://localhost:${PORT}`));


// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const path = require('path');
// const bodyParser = require('body-parser');
// const connectDB = require('./config/db');
// const bookRoutes = require('./routes/bookRoutes');

// dotenv.config();
// connectDB();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));
// app.set('view engine', 'ejs');

// // Routes
// app.use(bookRoutes);

// // 📌 Redirect Root to Search Page
// app.get('/', (req, res) => {
//     res.redirect('/books');
// });

// // Start Server & Open Browser
// app.listen(PORT, async () => {
//     console.log(`✅ Server running on port http://localhost:${PORT}`);
// });


