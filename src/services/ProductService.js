import { NetworkConfig } from '../config/NetworkConfig';

export class ProductService {
  static get SERVER_URL() {
    return NetworkConfig.getServerUrl();
  }

  static async searchProducts(productKeywords, productName, location = "United States") {
    try {
      // Use our Express server to get Google Shopping results
      const query = productKeywords.join(' ');

      const requestBody = {
        query: query,
        location: location,
        num: 3
      };

      console.log('Searching for:', query, 'via server');

      const response = await fetch(`${this.SERVER_URL}/api/search-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.results && data.results.length > 0) {
        return this.formatShoppingResults(data.results, productName);
      } else {
        console.warn('No shopping results found, using fallback');
        return this.getFallbackResults(productName);
      }
    } catch (error) {
      console.error('Product search error:', error);
      return this.getFallbackResults(productName);
    }
  }

  static formatShoppingResults(shoppingResults, productName) {
    return shoppingResults.slice(0, 3).map((result, index) => ({
      id: result.product_id || `fallback_${index}_${Date.now()}`,
      name: result.title || productName,
      price: result.price || 'Price not available',
      image: result.thumbnail || 'https://via.placeholder.com/200x200/4a7c59/ffffff?text=No+Image',
      source: result.source || 'Unknown Store',
      url: result.product_link || '#',
      rating: result.rating ? result.rating.toString() : '4.0',
      reviews: result.reviews || 0,
      description: result.snippet || `Sustainable ${productName.toLowerCase()} option`,
      features: this.extractFeatures(result.title, result.snippet),
      shipping: result.delivery || 'Shipping info not available',
      inStock: true, // Assume in stock if listed in shopping results
      serpApiData: result // Keep original data for reference
    }));
  }

  static getCountryCode(location) {
    // Map common location names to country codes for Google Shopping API
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

    // Return mapped country code or default to 'us'
    return locationMap[location] || 'us';
  }

  static extractFeatures(title, snippet) {
    const features = [];
    const text = `${title || ''} ${snippet || ''}`.toLowerCase();

    // Look for common sustainable/eco-friendly features
    const featureKeywords = {
      'Energy Efficient': ['energy efficient', 'energy star', 'low energy', 'efficient'],
      'Eco-Friendly': ['eco-friendly', 'environmentally friendly', 'green', 'sustainable'],
      'Organic': ['organic', 'natural', 'bio'],
      'Recyclable': ['recyclable', 'recycle', 'recycled'],
      'LED': ['led', 'led light'],
      'Smart': ['smart', 'wifi', 'app control'],
      'Long Lasting': ['durable', 'long lasting', 'lifetime'],
      'Carbon Neutral': ['carbon neutral', 'carbon free', 'net zero']
    };

    Object.entries(featureKeywords).forEach(([feature, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        features.push(feature);
      }
    });

    // Default features if none found
    if (features.length === 0) {
      features.push('Quality Product', 'Available Online');
    }

    return features.slice(0, 3); // Limit to 3 features
  }

  static generateMockResults(keywords, productName) {
    // Keep as fallback for when SerpApi fails
    const baseResults = [
      {
        id: 1,
        name: productName,
        price: this.generateRandomPrice(),
        image: 'https://via.placeholder.com/200x200/4a7c59/ffffff?text=Eco+Product',
        source: 'Amazon',
        url: `https://amazon.com/search?k=${encodeURIComponent(keywords[0])}`,
        rating: (4.0 + Math.random()).toFixed(1),
        reviews: Math.floor(Math.random() * 1000) + 100,
        description: `Eco-friendly ${productName.toLowerCase()} with sustainable materials`,
        features: ['Energy Efficient', 'Eco-Friendly', 'Long Lasting'],
        shipping: 'Free shipping',
        inStock: true
      },
      {
        id: 2,
        name: `Premium ${productName}`,
        price: this.generateRandomPrice(1.5),
        image: 'https://via.placeholder.com/200x200/2d5a27/ffffff?text=Premium+Eco',
        source: 'eBay',
        url: `https://ebay.com/sch/i.html?_nkw=${encodeURIComponent(keywords.join(' '))}`,
        rating: (4.2 + Math.random() * 0.5).toFixed(1),
        reviews: Math.floor(Math.random() * 500) + 50,
        description: `High-quality sustainable ${productName.toLowerCase()} from certified eco-friendly brands`,
        features: ['Certified Organic', 'Carbon Neutral', 'Recyclable'],
        shipping: '$5.99 shipping',
        inStock: true
      },
      {
        id: 3,
        name: `Budget ${productName}`,
        price: this.generateRandomPrice(0.7),
        image: 'https://via.placeholder.com/200x200/5a7c50/ffffff?text=Budget+Green',
        source: 'Local Store',
        url: 'https://maps.google.com/search/sustainable+home+goods+near+me',
        rating: (3.8 + Math.random() * 0.4).toFixed(1),
        reviews: Math.floor(Math.random() * 200) + 25,
        description: `Affordable eco-conscious ${productName.toLowerCase()} option`,
        features: ['Affordable', 'Good Quality', 'Local Business'],
        shipping: 'Pickup available',
        inStock: Math.random() > 0.2
      }
    ];

    return baseResults;
  }

  static generateRandomPrice(multiplier = 1) {
    const basePrice = 15 + Math.random() * 85; // $15-$100 base range
    const adjustedPrice = basePrice * multiplier;
    return `$${adjustedPrice.toFixed(2)}`;
  }

  static getFallbackResults(productName) {
    return [
      {
        id: 1,
        name: productName,
        price: '$29.99',
        image: 'https://via.placeholder.com/200x200/4a7c59/ffffff?text=Eco+Product',
        source: 'Amazon',
        url: 'https://amazon.com',
        rating: '4.3',
        reviews: 245,
        description: `Sustainable ${productName.toLowerCase()} option`,
        features: ['Eco-Friendly', 'Energy Efficient'],
        shipping: 'Free shipping',
        inStock: true
      }
    ];
  }

  static getSearchUrls(keywords) {
    const keywordString = keywords.join(' ');
    const encodedKeywords = encodeURIComponent(keywordString);

    return {
      amazon: `https://amazon.com/s?k=${encodedKeywords}`,
      ebay: `https://ebay.com/sch/i.html?_nkw=${encodedKeywords}`,
      etsy: `https://etsy.com/search?q=${encodedKeywords}`,
      google: `https://google.com/search?q=${encodedKeywords}+buy`,
      craigslist: `https://craigslist.org/search/sss?query=${encodedKeywords}`
    };
  }

  static generateAffiliateLink(product, source) {
    // In a real app, you'd generate proper affiliate links here
    const baseUrls = {
      'Amazon': 'https://amazon.com/s?k=',
      'eBay': 'https://ebay.com/sch/i.html?_nkw=',
      'Local Store': 'https://maps.google.com/search/'
    };

    const baseUrl = baseUrls[source] || 'https://google.com/search?q=';
    return baseUrl + encodeURIComponent(product.name);
  }
}