# SEO Local Keywords Heat Map

A web application that visualizes local SEO rankings across different geographic locations using interactive heat maps.

## Features

- **Interactive Heat Map**: Visualize your local SEO rankings across multiple locations
- **Grid-based Analysis**: Generate custom grids (3x3, 5x5, 7x7, or 10x10) of test locations
- **Real-time Rankings**: Fetch actual ranking data from Google Maps using SerpAPI
- **Visual Analytics**: Color-coded heat map showing ranking performance
- **Detailed Statistics**: View comprehensive statistics about your local SEO performance

## Prerequisites

- Node.js (v14 or higher)
- SerpAPI account and API key ([Get one here](https://serpapi.com/))

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd seo-heatmap
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your SerpAPI key to the `.env` file:
```
SERP_API_KEY=your_actual_serpapi_key_here
PORT=5000
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Using the application:
   - **Enter a keyword**: Type in the search term you want to analyze (e.g., "coffee shop near me")
   - **Set center coordinates**: Define the center point of your analysis area (latitude/longitude)
   - **Choose grid size**: Select how many test points to analyze (9, 25, 49, or 100 points)
   - **Set radius**: Define the search area radius in kilometers
   - **Click "Generate Heat Map"**: The app will analyze all locations and display the results

## How It Works

1. The application generates a grid of geographic coordinates around your specified center point
2. For each location, it queries the Google Maps API via SerpAPI to check rankings
3. Results are visualized as:
   - **Heat map overlay**: Red (excellent rankings) to green (poor/no rankings)
   - **Circular markers**: Color-coded markers you can click for detailed information
   - **Statistics panel**: Overview of performance across all locations

## Heat Map Legend

- 🔴 **Red (Top 3)**: Excellent rankings - positions 1-3
- 🟠 **Orange (4-10)**: Good rankings - positions 4-10
- 🟡 **Yellow (11-20)**: Fair rankings - positions 11-20
- 🟢 **Green (Not Ranked)**: Needs work - not in top 20 or not ranked

## API Endpoints

### POST `/api/rankings`

Fetch ranking data for multiple locations.

**Request Body:**
```json
{
  "keyword": "coffee shop near me",
  "locations": [
    { "lat": 40.7128, "lng": -74.0060 },
    { "lat": 40.7228, "lng": -74.0160 }
  ]
}
```

**Response:**
```json
{
  "keyword": "coffee shop near me",
  "results": [
    { "lat": 40.7128, "lng": -74.0060, "rank": 1 },
    { "lat": 40.7228, "lng": -74.0160, "rank": "Not ranked" }
  ]
}
```

## Configuration

You can customize the following in the web interface:

- **Center Latitude/Longitude**: Starting point for the analysis
- **Grid Size**: Number of test points (3x3, 5x5, 7x7, 10x10)
- **Radius**: Search area in kilometers (1-50 km)

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Mapping**: Leaflet.js with heat map plugin
- **API**: SerpAPI for Google Maps data
- **Styling**: Custom CSS with gradient backgrounds

## Notes

- SerpAPI has rate limits and costs associated with API calls
- Each heat map generation will make one API call per grid point
- Larger grids (10x10 = 100 points) will consume more API credits
- The application works best for analyzing local business rankings

## Troubleshooting

**"SERP_API_KEY not configured" error:**
- Make sure you've created a `.env` file with your API key
- Restart the server after adding the API key

**No results appearing:**
- Check your SerpAPI account for available credits
- Verify the keyword is relevant for Google Maps searches
- Try a smaller grid size first (3x3) to test

**Map not loading:**
- Check your internet connection (Leaflet.js loads from CDN)
- Clear browser cache and reload

## License

MIT License - feel free to use this for your SEO analysis needs!
