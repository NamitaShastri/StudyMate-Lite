require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(helmet());
app.use(express.json({ limit: '20kb' })); 
app.use(cors({
  origin: true, 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Proxy-Secret']
}));
app.use(morgan('tiny'));


const limiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 30, 
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);


const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PROXY_SECRET = process.env.PROXY_SECRET;

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in environment. Exiting.');
  process.exit(1);
}
if (!PROXY_SECRET) {
  console.error('Missing PROXY_SECRET in environment. Exiting.');
  process.exit(1);
}

async function callGemini(prompt) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  };

  const resp = await axios.post(`${endpoint}?key=${GEMINI_API_KEY}`, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000
  });

  return resp.data;
}


app.post('/api/generate', async (req, res) => {
  try {
    
    const clientSecret = req.header('X-Proxy-Secret') || '';
    if (!clientSecret || clientSecret !== PROXY_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { prompt, max_tokens } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.length > 5000) {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

   
    const data = await callGemini(prompt);

    
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    return res.json({ text, raw: data });
  } catch (err) {
    console.error('Proxy error', err?.response?.data || err.message || err);
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { message: err.message };
    return res.status(status).json({ error: data });
  }
});

app.get('/', (req, res) => {
  res.send('StudyMate proxy running.');
});

app.listen(PORT, () => {
  console.log(`StudyMate proxy listening on port ${PORT}`);
});
