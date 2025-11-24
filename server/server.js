require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "X-Proxy-Secret"],
  })
);

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const PROXY_SECRET = process.env.PROXY_SECRET;

if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

app.post("/api/generate", async (req, res) => {
  const secret = req.header("X-Proxy-Secret");
  if (secret !== PROXY_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      API_KEY;

    const response = await axios.post(
      url,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const text =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    res.json({ text });
  } catch (err) {
    console.error("Gemini error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log("StudyMate Proxy running on port", PORT);
});
