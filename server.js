
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/rankings', async (req, res) => {
  try {
    const { keyword, locations } = req.body;
    const SERP_API_KEY = process.env.SERP_API_KEY;

    if (!SERP_API_KEY) {
      return res.status(500).json({
        error: 'SERP_API_KEY not configured. Please add it to your .env file.'
      });
    }

    if (!keyword || !locations || locations.length === 0) {
      return res.status(400).json({
        error: 'Keyword and locations are required'
      });
    }

    console.log(`Processing ${locations.length} locations for keyword: "${keyword}"`);

    const requests = locations.map(loc =>
      axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_maps',
          q: keyword,
          ll: `${loc.lat},${loc.lng}`,
          api_key: SERP_API_KEY,
        }
      }).then(response => ({
        lat: loc.lat,
        lng: loc.lng,
        rank: response.data.local_results?.[0]?.position || 'Not ranked'
      })).catch(error => {
        console.error(`Error fetching data for location ${loc.lat},${loc.lng}:`, error.message);
        return { lat: loc.lat, lng: loc.lng, rank: '?' };
      })
    );

    const results = await Promise.all(requests);
    console.log(`Successfully processed ${results.length} locations`);
    res.json({ keyword, results });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
