const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL connection pool setup
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "smsba",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Secret key for JWT
const JWT_SECRET = "MACA";

// Sign-up route
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  let connection;
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    connection = await pool.getConnection();
    await connection.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    console.error("Error signing up: ", error);
    res.status(500).json({ error: "Error signing up" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
// Login route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  let connection;
  try {
    // Fetch user from database
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // If passwords match, user is authenticated

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET);

    // Send JWT token in response
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error signing in: ", error);
    res.status(500).json({ error: "Error signing in" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
