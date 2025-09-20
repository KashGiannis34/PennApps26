const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { getJson } = require('serpapi');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlist');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    // Expo Metro bundler (main development server)
    'http://localhost:8081',
    'http://10.251.143.142:8081',

    // Expo web server
    'http://localhost:19006',
    'http://10.251.143.142:19006',

    // Other Expo development ports
    'http://localhost:19000',    // Expo DevTools
    'http://localhost:19001',    // Expo tunnel
    'http://localhost:19002',    // Expo LAN

    // Mobile app origins (exp:// protocol)
    'exp://localhost:8081',
    'exp://10.251.143.142:8081',
    'exp://localhost:19000',
    'exp://10.251.143.142:19000',

    // Expo tunnel URLs (*.exp.direct domains)
    /https:\/\/.*\.exp\.direct/,
    /exp:\/\/.*\.exp\.direct/,

    // Allow all for development (be more restrictive in production)
    '*'
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL;
    const clientOptions = {
      family: 4, serverApi: { version: '1', strict: true, deprecationErrors: true},
    };
    if (mongoose.connection.readyState !== 1) {
			console.log("[mongo] Connecting to MongoDB...");
			await mongoose.connect(mongoURI, clientOptions);
			console.log("[mongo] Connected to MongoDB.");
		} else {
			console.log("[mongo] Already connected.");
		}

		const db = mongoose.connection.db;
		if (!db) {
			throw new Error("Database connection object is undefined after connect.");
		}

		await db.admin().command({ ping: 1 });
		console.log("[mongo] Connection verified with ping.");
  } catch (error) {
    console.error('❌ [mongo] connection error:', error);
    process.exit(1);
  }
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// SerpApi Google Shopping search endpoint
app.post('/api/search-products', async (req, res) => {
  try {
    const { query, location = "United States", num = 3 } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    // Map location to appropriate country code
    const getCountryCode = (location) => {
      const locationMap = {
        'United States': 'us',
        'Canada': 'ca',
        'United Kingdom': 'uk',
        'Germany': 'de',
        'France': 'fr',
        'Australia': 'au',
        'Japan': 'jp',
        'India': 'in',
        'Brazil': 'br',
        'Mexico': 'mx',
        'Spain': 'es',
        'Italy': 'it',
        'Netherlands': 'nl',
        'Sweden': 'se',
        'Norway': 'no',
        'Denmark': 'dk',
        'Finland': 'fi'
      };
      return locationMap[location] || 'us';
    };

    const searchParams = {
      engine: "google_shopping",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: num,
      location: location,
      hl: "en",
      gl: getCountryCode(location)
    };

    console.log('Searching for:', query, 'in', location);
    const response = await getJson(searchParams);

    if (response.shopping_results && response.shopping_results.length > 0) {
      res.json({
        success: true,
        results: response.shopping_results,
        totalResults: response.shopping_results.length,
        query: query,
        location: location
      });
    } else {
      res.json({
        success: false,
        message: 'No shopping results found',
        results: [],
        query: query,
        location: location
      });
    }

  } catch (error) {
    console.error('SerpApi search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message,
      query: req.body.query
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /api/search-products'
    ]
  });
});

// Start server with tunnel support
async function startServer() {
  // Connect to MongoDB first
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 SerpApi server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Search endpoint: POST http://localhost:${PORT}/api/search-products`);

    // Check if SERPAPI_KEY is configured
    if (!process.env.SERPAPI_KEY) {
      console.warn('⚠️  SERPAPI_KEY not found in environment variables');
      console.warn('   Please add SERPAPI_KEY=your_api_key_here to your .env file');
    } else {
      console.log('✅ SERPAPI_KEY configured');
    }

    // Instructions for tunnel mode
    console.log('\n📱 For Expo tunnel mode:');
    console.log('1. Download ngrok from https://ngrok.com/download');
    console.log('2. Run: ngrok http 3001');
    console.log('3. Copy the https URL (e.g., https://abc123.ngrok.io)');
    console.log('4. Add to your .env file: EXPO_PUBLIC_SERVER_URL=https://abc123.ngrok.io');
    console.log('5. Restart your Expo app');
  });

  return server;
}

startServer().catch(console.error);

module.exports = app;