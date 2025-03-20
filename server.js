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

    const prompt = `
      Based on the user's health data:
      - Age: ${age}
      - Weight: ${weight}kg
      - Blood Pressure: ${bp}
      - Heart Rate: ${heartRate}

      Predict the likelihood of developing diabetes and hypertension as a percentage.
      Also, provide advice on how to prevent or manage these diseases In Arabic.

      Respond **only** in JSON format with this structure:
      {
        "diabetes_risk": "percentage",
        "hypertension_risk": "percentage",
        "advice": "string"
      }
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a medical AI assistant providing structured health predictions." },
          { role: "user", content: prompt }
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

    // Extract and clean JSON output
    const aiResponseText = response.data.choices[0].message.content;
    const cleanJson = aiResponseText.replace(/```json|```/g, "").trim();
    const aiResponse = JSON.parse(cleanJson);

    res.json({
      diabetes_risk: aiResponse.diabetes_risk,
      hypertension_risk: aiResponse.hypertension_risk,
      advice: aiResponse.advice
    });

  } catch (error) {
    console.error("Prediction Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});



app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a healthcare chatbot that answers medical questions in Arabic." },
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
