import axios from 'axios';
import { fetchDocumentById } from '../constants/firebaseFunctions'; // Update the path as per your project structure

const TEXT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

const OpenAIService = {
  /**
   * Sends a message to OpenAI's API and returns the response.
   * Includes user data from Firestore as context for personalized advice.
   * @param {Array} messages - The chat history, including system and user messages.
   * @param {string} userId - The ID of the current user.
   * @returns {Promise<string>} - The AI-generated response, formatted in Markdown.
   */
  sendMessage: async (messages, userId) => {
    try {
      // Fetch user data from Firestore
      const [user, lifestyle, medicalHistory] = await Promise.all([
        fetchDocumentById('users', userId),
        fetchDocumentById('lifestyle', userId),
        fetchDocumentById('medicalHistory', userId),
      ]);

      // Format user data for the AI context in Markdown
      const userDataContext = `
### User Profile:
${user ? '```json\n' + JSON.stringify(user, null, 2) + '\n```' : 'No user data available'}

### Lifestyle Data:
${lifestyle ? '```json\n' + JSON.stringify(lifestyle, null, 2) + '\n```' : 'No lifestyle data available'}

### Medical History:
${medicalHistory ? '```json\n' + JSON.stringify(medicalHistory, null, 2) + '\n```' : 'No medical history available'}
      `;

      const response = await axios.post(
        TEXT_ENDPOINT,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional doctor providing medical advice. Use the provided user data for context to give personalized responses. 

- For medical questions, provide detailed, accurate advice.
- For data requests (e.g., 'my data', 'show my information'), provide the user's data in a structured format.
- Politely decline to answer non-medical questions, stating that you can only provide medical advice.

Ensure all responses are professional, friendly, and formatted in Markdown.

Examples:
- User: 'What should I do about my headache?'
  AI: 'Based on your medical history, it might be caused by tension. I recommend trying over-the-counter pain relievers and relaxation techniques.'
  
- User: 'Can you provide my medical information?'
  AI: 'Here is your medical data: [data in Markdown format]'
  
- User: 'What’s the capital of Canada?'
  AI: 'I’m here to provide medical advice. For non-medical questions, please consult another source.'

  So also, you can talk with the user based on his language so you are a multiple language speaker,
  If the question was outside of the context is not related to the doctor response with a joke,

User Data Context: ${userDataContext}`
            },
            ...messages.map((msg) => ({
              role: msg.sender === 'AI' ? 'assistant' : 'user',
              content: msg.text,
            })),
          ],
          temperature: 0.5,
          max_tokens: 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      // Return the AI's response, ensuring it's formatted in Markdown
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error in OpenAIService:', error);
      throw new Error('Failed to fetch AI response');
    }
  },
};

export default OpenAIService;