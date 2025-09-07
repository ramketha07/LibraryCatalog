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
        res.redirect("/");
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
