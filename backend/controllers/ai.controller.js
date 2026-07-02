import axios from 'axios';

// Legacy endpoint: keeps working for any existing frontend usage.
// POST /api/ai/generate { payLoad: string }
const ecoBot = async (req, res) => {
  try {
    const { payLoad } = req.body;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',
      {
        contents: [{ parts: [{ text: payLoad }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': process.env.GEMINI_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
};

export { ecoBot };

