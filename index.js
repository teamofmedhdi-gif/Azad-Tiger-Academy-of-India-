// ===============================
// ATA Attendance Backend (Node.js)
// ===============================

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// MySQL CONNECTION (InfinityFree)
// ===============================
const db = mysql.createConnection({
  host: "sql300.infinityfree.com",
  user: "if0_40550520",
  password: "GE0f2pgiQrUD",
  database: "if0_40550520_ata",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

// ===============================
// CREATE TABLES (AUTO)
// ===============================
db.query(`
CREATE TABLE IF NOT EXISTS cadets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  ata_code VARCHAR(50),
  rank VARCHAR(50),
  branch VARCHAR(50)
)
`);

db.query(`
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cadet_name VARCHAR(100),
  ata_code VARCHAR(50),
  date DATE,
  status VARCHAR(20),
  marked_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

// ===============================
// ADMIN LOGIN API
// ===============================
app.post("/admin-login", (req, res) => {
  const { email } = req.body;

  if (email === "super@admin.com" || email === "sohail@ata.com") {
    return res.json({
      success: true,
      role: email === "super@admin.com" ? "SUPER_ADMIN" : "ADMIN",
    });
  }

  res.status(401).json({ success: false, message: "Unauthorized Admin" });
});

// ===============================
// ADD CADET (OPTIONAL)
// ===============================
app.post("/add-cadet", (req, res) => {
  const { name, ata_code, rank, branch } = req.body;

  const sql = `INSERT INTO cadets (name, ata_code, rank, branch) VALUES (?,?,?,?)`;
  db.query(sql, [name, ata_code, rank, branch], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ===============================
// SEARCH CADET (NAME TYPE FEATURE)
// ===============================
app.get("/search-cadet", (req, res) => {
  const { q } = req.query;

  const sql = `SELECT * FROM cadets WHERE name LIKE ?`;
  db.query(sql, [`%${q}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ===============================
// MARK ATTENDANCE
// ===============================
app.post("/mark-attendance", (req, res) => {
  const { cadet_name, ata_code, date, marked_by } = req.body;

  const sql = `
    INSERT INTO attendance (cadet_name, ata_code, date, status, marked_by)
    VALUES (?, ?, ?, 'PRESENT', ?)
  `;

  db.query(sql, [cadet_name, ata_code, date, marked_by], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: "Attendance Marked" });
  });
});

// ===============================
// GET ATTENDANCE (CADETS SITE)
// ===============================
app.get("/attendance", (req, res) => {
  const { date } = req.query;

  const sql = `SELECT * FROM attendance WHERE date = ?`;
  db.query(sql, [date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ===============================
// SERVER START
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ATA Backend running on port ${PORT}`);
});
    
