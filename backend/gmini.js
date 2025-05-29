import axios from 'axios';
const GEMINI_API_KEY = 'AIzaSyDLEO_ekHu_HUwZz82QfmGqiKUny_Oxz-U';

const generateContent = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const answer = response.data.candidates[0].content.parts[0].text;
    console.log(answer);  // ✅ Sirf answer print hoga
  } catch (error) {
    console.error('Error:', error);
  }
};

// Example call
generateContent('ek simple si website banao');
