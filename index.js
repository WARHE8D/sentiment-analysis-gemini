import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({});
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));


async function analyzeSentiment(text) {
  if (!text) {
    return "Error: No text provided for analysis.";
  }

  const prompt = `Perform sentiment analysis on the following text. 
        Analyze the tone (e.g., Positive, Negative, Neutral). 
        Your response must be a single word for the sentiment (e.g., Positive, Negative, Neutral), 
        followed by a colon, and then a brief (one sentence) explanation. 
        Text: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("API Call Error:", error);
    return "API Error: Could not complete analysis. Check server logs.";
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/analyze", async (req, res) => {
  const inputText = req.body.text;
  const analysisResult = await analyzeSentiment(inputText);
  res.json({ sentiment: analysisResult });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Open your browser and navigate to the address above.");
});
