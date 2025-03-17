
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/rankings', async (req, res) => {
  const { keyword, locations } = req.body;
  const SERP_API_KEY = process.env.SERP_API_KEY;
  
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
    })).catch(() => ({ lat: loc.lat, lng: loc.lng, rank: '?' }))
  );

  const results = await Promise.all(requests);
  res.json({ keyword, results });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
