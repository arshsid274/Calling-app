require('dotenv').config();
const express = require('express');
const telnyx = require('telnyx');
const telnyxClient = telnyx(process.env.TELNYX_API_KEY);
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Store call history in memory (use a database in production)
let callHistory = [];

// Webhook endpoint to receive call events from Telnyx
app.post('/webhook', (req, res) => {
  // ... existing code ...
});

// Initiate a call
app.post('/call', async (req, res) => {
  const { to } = req.body;
  try {
    const call = await telnyxClient.calls.create({
      from: process.env.TELNYX_PHONE_NUMBER,
      to,
      connection_id: process.env.TELNYX_CONNECTION_ID,
      record: 'record-from-answer',
      webhook_url: `${process.env.VERCEL_URL}/api/webhook`,
    });
    // ... rest of the code ...
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... rest of the endpoints ...

// Get call recording URL
app.get('/recording/:callId', async (req, res) => {
  const { callId } = req.params;
  try {
    const recordings = await telnyxClient.callRecordings.list({ filter: { call_control_id: callId } });
    if (recordings.data.length > 0) {
      const recording = recordings.data[0];
      const recordingUrl = await telnyxClient.callRecordings.retrieve(recording.id);
      res.json({ recordingUrl: recordingUrl.download_url });
    } else {
      res.status(404).json({ error: 'Recording not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export for Vercel
module.exports = app;