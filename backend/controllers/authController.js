const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../config/db");


// ================= REGISTER USER =================
exports.registerUser = async (req, res) => {

  const { email, password } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const query =
      "INSERT INTO users (email, password, verification_token, is_verified) VALUES (?, ?, ?, false)";

    db.query(query, [email, hashedPassword, verificationToken], async (err) => {

      if (err) {
        return res.status(400).json({
          message: "User already exists"
        });
      }

      const verificationLink =
        `http://localhost:5000/api/auth/verify/${verificationToken}`;

      // IMPORTANT: Print link in terminal for development
      console.log("Verification link:", verificationLink);

      // Email transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS
        }
      });

      try {

        await transporter.sendMail({
          to: email,
          subject: "Verify your CloudSage account",
          html: `
          <h2>CloudSage Email Verification</h2>
          <p>Click the link below to verify your account:</p>
          <a href="${verificationLink}">${verificationLink}</a>
          `
        });

      } catch (mailError) {

        console.log("Email sending failed (development mode)");
        console.log(mailError.message);

      }

      res.json({
        message: "User registered. Verification link printed in terminal."
      });

    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};


// ================= LOGIN USER =================
exports.loginUser = (req, res) => {

  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], async (err, results) => {

    if (results.length === 0) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const user = results[0];

    if (!user.is_verified) {
      return res.status(401).json({
        message: "Please verify your email first"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });

  });

};


// ================= VERIFY EMAIL =================
exports.verifyEmail = (req, res) => {

  const token = req.params.token;

  const query =
    "UPDATE users SET is_verified = true WHERE verification_token = ?";

  db.query(query, [token], (err, result) => {

    if (err) {
      return res.status(500).send("Server error");
    }

    if (result.affectedRows === 0) {
      return res.send("Invalid verification token");
    }

    res.send("Email verified successfully. You can now login.");

  });

};