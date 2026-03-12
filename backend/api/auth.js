const express = require("express");
const router = express.Router();

const db = require("../config/db");
const jwt = require("jsonwebtoken");

const SECRET = "cloudsage_secret";

/* LOGIN ROUTE */

router.post("/login", (req, res) => {

    const email = req.body.email.trim();
    const password = req.body.password.trim();

    console.log("Login attempt:");
    console.log("Email:", email);
    console.log("Password:", password);

    const query = "SELECT * FROM users WHERE email=? AND password=?";

    db.query(query, [email, password], (err, result) => {

        if (err) {
            console.log("Database error:", err);
            return res.status(500).json({
                message: "Server error"
            });
        }

        if (result.length === 0) {
            console.log("Invalid credentials");
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        /* CREATE JWT TOKEN */

        const token = jwt.sign(
            { email: result[0].email },
            SECRET,
            { expiresIn: "1h" }
        );

        console.log("Login successful");

        res.json({
            message: "Login successful",
            token: token
        });

    });

});

module.exports = router;
