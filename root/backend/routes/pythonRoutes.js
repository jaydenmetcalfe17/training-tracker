// backend/routes/pythonRoutes.js
const express = require("express");
const router = express.Router();

router.get("/analyze", async (req, res) => {
  const response = await fetch("http://localhost:8000/");
  const data = await response.json();
  res.json(data);
});




router.post("/analyze", async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error calling Python API:", err);
    res.status(500).json({ error: "Failed to reach Python backend" });
  }
});





module.exports = router;