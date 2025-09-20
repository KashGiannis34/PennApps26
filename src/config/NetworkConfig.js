// Network configuration for different environments
export const NetworkConfig = {
  // Get IP and port from environment variables (with fallbacks)
  LAPTOP_IP: process.env.EXPO_PUBLIC_LAPTOP_IP,
  SERVER_PORT: parseInt(process.env.EXPO_PUBLIC_SERVER_PORT) || 3001,

  // Get the appropriate server URL based on environment
  getServerUrl() {
    // Check if we have a custom server URL (for tunneling)
    if (process.env.EXPO_PUBLIC_SERVER_URL) {
      return process.env.EXPO_PUBLIC_SERVER_URL;
    }

    const isWeb = typeof window !== 'undefined' && window.location;

    if (isWeb) {
      // Running on web (Expo web) - use localhost
      return `http://localhost:${this.SERVER_PORT}`;
    } else {
      // Running on mobile device - use laptop's IP address
      return `http://${this.LAPTOP_IP}:${this.SERVER_PORT}`;
    }
  }
};

// Port Reference:
// - Expo Metro bundler: 8081 (main development server)
// - Expo web: 19006
// - Our Express API server: 3001 (SERVER_PORT)
// - Expo DevTools: 19000-19002

// Configuration Priority (NetworkConfig will use the first available):
// 1. EXPO_PUBLIC_SERVER_URL (for ngrok tunnel) - Currently: https://6b44d7efb053.ngrok-free.app
// 2. http://localhost:3001 (for web)
// 3. http://LAPTOP_IP:3001 (for mobile on same network)

// Setup Instructions:
// For Expo Tunnel Mode (current setup):
// 1. Run: ngrok http 3001
// 2. Add tunnel URL to .env: EXPO_PUBLIC_SERVER_URL=https://your-url.ngrok-free.app
// 3. Start Expo with: npx expo start --tunnel
//
// For LAN Mode (alternative):
// 1. Set EXPO_PUBLIC_LAPTOP_IP=your.laptop.ip.address in .env
// 2. Start Expo with: npx expo start --lan
// 3. Make sure phone and laptop are on same WiFi network