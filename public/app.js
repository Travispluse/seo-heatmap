// Initialize map
let map;
let heatLayer;
let markersLayer;

const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : '';

function initMap() {
    const centerLat = parseFloat(document.getElementById('centerLat').value);
    const centerLng = parseFloat(document.getElementById('centerLng').value);

    if (map) {
        map.remove();
    }

    map = L.map('map').setView([centerLat, centerLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
}

// Generate grid of locations around center point
function generateLocationGrid(centerLat, centerLng, gridSize, radiusKm) {
    const locations = [];
    const latOffset = radiusKm / 111; // 1 degree latitude ≈ 111 km
    const lngOffset = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180));

    const step = gridSize - 1;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const lat = centerLat - latOffset + (2 * latOffset * i / step);
            const lng = centerLng - lngOffset + (2 * lngOffset * j / step);
            locations.push({ lat, lng });
        }
    }

    return locations;
}

// Convert rank to heat intensity (0-1)
function rankToIntensity(rank) {
    if (rank === 'Not ranked' || rank === '?') return 0.1;
    const numRank = parseInt(rank);
    if (numRank <= 3) return 1.0;
    if (numRank <= 10) return 0.7;
    if (numRank <= 20) return 0.4;
    return 0.2;
}

// Get color based on rank
function getRankColor(rank) {
    if (rank === 'Not ranked' || rank === '?') return '#00ff00';
    const numRank = parseInt(rank);
    if (numRank <= 3) return '#ff0000';
    if (numRank <= 10) return '#ffaa00';
    if (numRank <= 20) return '#ffff00';
    return '#00ff00';
}

// Update status message
function updateStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

// Display results
function displayResults(keyword, results) {
    const resultsDiv = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');

    resultsDiv.classList.remove('hidden');

    const stats = {
        total: results.length,
        top3: 0,
        top10: 0,
        top20: 0,
        notRanked: 0
    };

    results.forEach(r => {
        if (r.rank === 'Not ranked' || r.rank === '?') {
            stats.notRanked++;
        } else {
            const numRank = parseInt(r.rank);
            if (numRank <= 3) stats.top3++;
            if (numRank <= 10) stats.top10++;
            if (numRank <= 20) stats.top20++;
        }
    });

    resultsContent.innerHTML = `
        <div class="result-card">
            <h4>Keyword</h4>
            <p>${keyword}</p>
        </div>
        <div class="result-card">
            <h4>Total Locations</h4>
            <p>${stats.total} points analyzed</p>
        </div>
        <div class="result-card">
            <h4>Top 3 Rankings</h4>
            <p>${stats.top3} locations (${((stats.top3/stats.total)*100).toFixed(1)}%)</p>
        </div>
        <div class="result-card">
            <h4>Top 10 Rankings</h4>
            <p>${stats.top10} locations (${((stats.top10/stats.total)*100).toFixed(1)}%)</p>
        </div>
        <div class="result-card">
            <h4>Top 20 Rankings</h4>
            <p>${stats.top20} locations (${((stats.top20/stats.total)*100).toFixed(1)}%)</p>
        </div>
        <div class="result-card">
            <h4>Not Ranked</h4>
            <p>${stats.notRanked} locations (${((stats.notRanked/stats.total)*100).toFixed(1)}%)</p>
        </div>
    `;
}

// Generate heat map
async function generateHeatMap() {
    const keyword = document.getElementById('keyword').value.trim();
    const centerLat = parseFloat(document.getElementById('centerLat').value);
    const centerLng = parseFloat(document.getElementById('centerLng').value);
    const gridSize = parseInt(document.getElementById('gridSize').value);
    const radius = parseFloat(document.getElementById('radius').value);

    if (!keyword) {
        updateStatus('Please enter a keyword', 'error');
        return;
    }

    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    try {
        updateStatus('Generating location grid...', 'loading');
        const locations = generateLocationGrid(centerLat, centerLng, gridSize, radius);

        updateStatus(`Fetching rankings for ${locations.length} locations... This may take a moment.`, 'loading');

        const response = await fetch(`${API_URL}/api/rankings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keyword, locations })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();

        updateStatus('Rendering heat map...', 'loading');

        // Clear existing layers
        markersLayer.clearLayers();
        if (heatLayer) {
            map.removeLayer(heatLayer);
        }

        // Prepare heat map data
        const heatData = data.results.map(r => [
            r.lat,
            r.lng,
            rankToIntensity(r.rank)
        ]);

        // Add heat layer
        heatLayer = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.0: '#00ff00',
                0.3: '#ffff00',
                0.6: '#ffaa00',
                1.0: '#ff0000'
            }
        }).addTo(map);

        // Add markers with popups
        data.results.forEach(r => {
            const color = getRankColor(r.rank);
            const marker = L.circleMarker([r.lat, r.lng], {
                radius: 8,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });

            marker.bindPopup(`
                <div>
                    <strong>Keyword:</strong> ${keyword}<br>
                    <strong>Location:</strong> ${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}<br>
                    <strong>Rank:</strong> <span class="popup-rank">${r.rank}</span>
                </div>
            `);

            marker.addTo(markersLayer);
        });

        displayResults(keyword, data.results);
        updateStatus(`✓ Successfully analyzed ${data.results.length} locations!`, 'success');

    } catch (error) {
        console.error('Error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Heat Map';
    }
}

// Clear map and results
function clearMap() {
    if (markersLayer) {
        markersLayer.clearLayers();
    }
    if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
    }
    document.getElementById('results').classList.add('hidden');
    updateStatus('', '');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initMap();

    document.getElementById('generateBtn').addEventListener('click', generateHeatMap);
    document.getElementById('clearBtn').addEventListener('click', clearMap);

    // Re-center map when coordinates change
    document.getElementById('centerLat').addEventListener('change', initMap);
    document.getElementById('centerLng').addEventListener('change', initMap);

    // Allow Enter key to trigger generation
    document.getElementById('keyword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateHeatMap();
        }
    });
});
