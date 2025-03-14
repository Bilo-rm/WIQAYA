require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = 5000;

console.log("🔑 API Key Loaded:", process.env.OPENAI_API_KEY ? "✅ YES" : "❌ NO");
app.use(cors());
app.use(bodyParser.json());

app.post("/predict", async (req, res) => {
  try {
    const { age, weight, bp, heartRate } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a medical AI assistant helping users predict diabetes and hypertension." },
          { role: "user", content: `Predict my health risk based on: Age=${age}, Weight=${weight}kg, Blood Pressure=${bp}, Heart Rate=${heartRate}` }
        ],
        temperature: 0.7
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      }
    );

    res.json({ prediction: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Prediction Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a healthcare chatbot that answers medical questions." },
          { role: "user", content: message }
        ],
        temperature: 0.7
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      }
    );

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Chatbot Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Chatbot response failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
