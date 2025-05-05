// ✅ server.js - يربط chat.js بـ gptClient.js ويشغّل GPT-4o API من GitHub
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { askRafiq } from "./gptClient.js";

dotenv.config();
const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "https://rafiq01.netlify.app", // دومين فرونتند Netlify
  })
);
app.use(bodyParser.json());
app.options("*", cors());

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const reply = await askRafiq(userMessage);
    res.json({ reply });
  } catch (error) {
    console.error("Error in /ask:", error);
    res.status(500).json({ reply: "حدث خطأ أثناء الاتصال بالمساعد." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
