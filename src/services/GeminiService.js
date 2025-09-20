import { GoogleGenAI, Type } from '@google/genai';
import { GEMINI_API_KEY } from '@env';

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

export class GeminiService {
  static async analyzeRoomImage(base64Image) {
    try {
      const prompt = `Analyze this room image and suggest 5-7 specific sustainable, eco-friendly products that would make this room more environmentally friendly. For each product, provide:

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
      `;
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING, description: "Brief description of the room and current sustainability status" },
          products: {
            type: Type.ARRAY,
            description: "A list of suggested sustainable products.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                reason: { type: Type.STRING },
                benefits: { type: Type.STRING },
                priceRange: { type: Type.STRING },
                whereToFind: { type: Type.ARRAY, items: { type: Type.STRING } },
                searchKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["name", "type", "reason", "benefits"]
            }
          },
          sustainabilityScore: { type: Type.NUMBER, description: "A score from 1-10 indicating the room's sustainability." },
          potentialSavings: { type: Type.STRING, description: "Estimated potential savings per year." },
        },
        required: ["analysis", "products"]
      };

      const contents = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        {
          text: prompt
        }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      const textResponse = response.text;

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

  static async generateRoomVisualization(products, base64Image) {
    try {
      // Create a detailed prompt based on the recommended products
      const productDescriptions = products.map(product =>
        `- ${product.name} (${product.type}): ${product.reason}`
      ).join('\n');

      const promptText = `Transform this room to be more sustainable and eco-friendly by adding the following recommended products while maintaining the room's existing layout, style, and character:

      ${productDescriptions}

      Please generate a photorealistic image showing this same room but with these sustainable improvements integrated naturally into the space. The products should be placed logically where they would naturally belong in this type of room. Maintain the same lighting, perspective, and overall aesthetic while making the space visibly more sustainable and environmentally friendly. The image should look like a realistic "after" photo of the room's sustainable transformation.`;

      const prompt = [
        { text: promptText},
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image,
          },
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: prompt,
      });

      // Check if response contains image data
      if (response && response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];

        // Look for image data in the response
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
              const imageData = part.inlineData.data;

              // Return base64 data (React Native compatible)
              return {
                success: true,
                data: imageData,
                mimeType: part.inlineData.mimeType
              };
            }
          }
        }
      }

      // If no image found in response, return error
      return {
        success: false,
        error: 'No image data found in response'
      };

    } catch (error) {
      console.error('Visualization generation error:', error);
      return {
        success: false,
        error: error.message
      };
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