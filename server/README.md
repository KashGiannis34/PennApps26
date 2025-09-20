# Express Server Setup Instructions

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your SerpApi key to the `.env` file:
```
SERPAPI_KEY=your_actual_serpapi_key_here
PORT=3001
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## Available Endpoints

- `GET /health` - Health check endpoint
- `POST /api/search-products` - Product search endpoint

### Example API Usage

```javascript
// Search for products
const response = await fetch('http://localhost:3001/api/search-products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'LED light bulbs energy efficient',
    location: 'United States',
    num: 3
  })
});

const data = await response.json();
```

## CORS Configuration

The server is configured to accept requests from:
- `http://localhost:8081` (Expo web)
- `http://localhost:19006` (Expo web alternative)
- `exp://192.168.1.*` (Expo mobile dev)

Update the CORS origins in `server.js` if you need to add other URLs.

## Troubleshooting

1. **Server won't start**: Check if port 3001 is available
2. **API calls fail**: Verify SERPAPI_KEY is set correctly
3. **CORS errors**: Add your Expo dev server URL to the CORS origins
4. **No results**: Check server logs for SerpApi errors