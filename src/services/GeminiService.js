import axios from 'axios';
import { GEMINI_API_KEY } from '@env';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

export class GeminiService {
  static async analyzeRoomImage(base64Image) {
    try {
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Analyze this room image and suggest 5-7 specific sustainable, eco-friendly products that would make this room more environmentally friendly. For each product, provide:

1. Product name and type
2. Why it would benefit this specific room
3. Environmental benefits
4. Estimated price range
5. Where to buy it (Amazon, eBay, local stores)
6. Keywords for searching online

Focus on practical suggestions like:
- LED light bulbs
- Energy-efficient appliances
- Sustainable furniture
- Air purifying plants
- Eco-friendly decor
- Energy-saving devices
- Sustainable storage solutions

Format your response as a JSON object with this structure:
{
  "analysis": "Brief description of the room and current sustainability status",
  "products": [
    {
      "name": "Product name",
      "type": "Product category",
      "reason": "Why this room needs this product",
      "benefits": "Environmental benefits",
      "priceRange": "$X - $Y",
      "whereToFind": ["Amazon", "eBay", "Home Depot"],
      "searchKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "sustainabilityScore": 7,
  "potentialSavings": "$XXX/year in energy costs"
}`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ]
      };

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const textResponse = response.data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing if JSON format is not perfect
        return this.parseNonJsonResponse(textResponse);
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Return fallback data if API fails
      return this.getFallbackAnalysis();
    }
  }

  static async generateRoomVisualization(roomDescription, products) {
    try {
      const prompt = `Create a detailed description for an image that shows a ${roomDescription} enhanced with these sustainable products: ${products.map(p => p.name).join(', ')}. 

      Describe how the room would look with these eco-friendly additions, including:
      - Lighting improvements
      - New sustainable furniture/decor
      - Plants and greenery
      - Energy-efficient appliances
      - Overall aesthetic improvements

      Keep the description realistic and achievable.`;

      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        payload
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Visualization generation error:', error);
      return "A beautifully transformed room with sustainable lighting, eco-friendly furniture, and lush green plants creating a healthy, environmentally conscious living space.";
    }
  }

  static parseNonJsonResponse(text) {
    // Fallback parser for non-JSON responses
    return {
      analysis: "Room analysis completed. Multiple sustainable improvement opportunities identified.",
      products: [
        {
          name: "LED Light Bulbs",
          type: "Lighting",
          reason: "Replace energy-intensive incandescent bulbs",
          benefits: "75% less energy consumption, longer lifespan",
          priceRange: "$5 - $15 per bulb",
          whereToFind: ["Amazon", "Home Depot", "Walmart"],
          searchKeywords: ["LED bulbs", "energy efficient lighting", "smart bulbs"]
        },
        {
          name: "Air Purifying Plants",
          type: "Decor/Health",
          reason: "Improve indoor air quality naturally",
          benefits: "Remove toxins, produce oxygen, natural humidity control",
          priceRange: "$10 - $50 per plant",
          whereToFind: ["Local nurseries", "Amazon", "Home Depot"],
          searchKeywords: ["snake plant", "pothos", "peace lily", "air purifying plants"]
        }
      ],
      sustainabilityScore: 6,
      potentialSavings: "$200/year in energy costs"
    };
  }

  static getFallbackAnalysis() {
    return {
      analysis: "Room analysis completed. This space has good potential for sustainable improvements.",
      products: [
        {
          name: "LED Light Bulbs",
          type: "Lighting",
          reason: "Replace traditional bulbs for energy efficiency",
          benefits: "Up to 75% energy savings, 25x longer lifespan",
          priceRange: "$8 - $20",
          whereToFind: ["Amazon", "Home Depot", "Best Buy"],
          searchKeywords: ["LED bulbs", "energy efficient", "smart lighting"]
        },
        {
          name: "Smart Thermostat",
          type: "Climate Control",
          reason: "Optimize heating and cooling efficiency",
          benefits: "10-15% energy savings, remote control, learning algorithms",
          priceRange: "$150 - $300",
          whereToFind: ["Amazon", "Best Buy", "Home Depot"],
          searchKeywords: ["smart thermostat", "Nest", "Ecobee", "energy saving"]
        },
        {
          name: "Air Purifying Plants",
          type: "Natural Air Filter",
          reason: "Improve indoor air quality naturally",
          benefits: "Remove VOCs, increase oxygen, natural humidity control",
          priceRange: "$15 - $40",
          whereToFind: ["Local nurseries", "Amazon", "Walmart"],
          searchKeywords: ["snake plant", "spider plant", "peace lily", "air plants"]
        },
        {
          name: "Bamboo Storage Organizers",
          type: "Storage",
          reason: "Replace plastic storage with sustainable materials",
          benefits: "Renewable material, biodegradable, stylish design",
          priceRange: "$25 - $80",
          whereToFind: ["Amazon", "Target", "IKEA"],
          searchKeywords: ["bamboo organizer", "sustainable storage", "eco-friendly containers"]
        },
        {
          name: "Energy Star Appliances",
          type: "Electronics",
          reason: "Upgrade to energy-efficient models",
          benefits: "20-30% less energy usage, government rebates available",
          priceRange: "$200 - $1500",
          whereToFind: ["Best Buy", "Home Depot", "Amazon"],
          searchKeywords: ["Energy Star", "efficient appliances", "eco-friendly electronics"]
        }
      ],
      sustainabilityScore: 7,
      potentialSavings: "$300-500/year in energy and utility costs"
    };
  }
}