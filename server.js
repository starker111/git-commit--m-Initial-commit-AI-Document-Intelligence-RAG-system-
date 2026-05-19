const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = 3000;

// Use production n8n webhook URLs after publishing your workflow
const N8N_BASE_URL = "http://localhost:5678/webhook";

// If testing only, change above to:
// const N8N_BASE_URL = "http://localhost:5678/webhook-test";

const INGEST_URL = `${N8N_BASE_URL}/ingest`;
const ASK_URL = `${N8N_BASE_URL}/ask`;

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", async (req, res) => {
  const status = {
    ui: "ok",
    n8nBaseUrl: N8N_BASE_URL,
    ollama: "unknown",
    chroma: "unknown"
  };

  try {
    await axios.get("http://localhost:11434/api/tags", { timeout: 5000 });
    status.ollama = "online";
  } catch {
    status.ollama = "offline";
  }

  try {
    await axios.get("http://localhost:8010/health", { timeout: 5000 });
    status.chroma = "online";
  } catch {
    status.chroma = "offline";
  }

  res.json(status);
});

app.post("/api/ingest", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No PDF file uploaded"
      });
    }

    const form = new FormData();

    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype || "application/pdf"
    });

    const response = await axios.post(INGEST_URL, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 300000
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to ingest document",
      details: error.response?.data || error.message
    });
  }
});

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Question is required"
      });
    }

    const response = await axios.post(
      ASK_URL,
      { question: question.trim() },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 300000
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to generate answer",
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Document Intelligence UI running at http://localhost:${PORT}`);
});