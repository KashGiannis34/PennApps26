import { NetworkConfig } from '../config/NetworkConfig';
import { AuthService } from './AuthService';

export class WishlistService {
  static get API_URL() {
    return NetworkConfig.getServerUrl();
  }

  // Get user's wishlist
  static async getWishlist() {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      console.log('Fetching wishlist from:', `${this.API_URL}/api/wishlist/`);

      const response = await fetch(`${this.API_URL}/api/wishlist/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, wishlist: data.data.wishlist };
      } else {
        return { success: false, error: data.message || 'Failed to fetch wishlist' };
      }
    } catch (error) {
      console.error('Wishlist fetch error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Add item to wishlist
  static async addToWishlist(productData) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      // Format product data for the API
      const wishlistItem = {
        productId: productData.id?.toString() || Math.random().toString(),
        name: productData.name,
        price: productData.price,
        image: productData.image,
        source: productData.source || 'Unknown',
        url: productData.url || '#',
        rating: productData.rating || '0',
        reviews: productData.reviews || 0,
        description: productData.description || '',
        features: productData.features || [],
        shipping: productData.shipping || 'Shipping info not available',
        inStock: productData.inStock !== undefined ? productData.inStock : true,
        searchKeywords: productData.searchKeywords || [],
        category: productData.category || 'Sustainable Products'
      };

      console.log('Adding to wishlist:', wishlistItem);

      const response = await fetch(`${this.API_URL}/api/wishlist/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wishlistItem),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.message || 'Failed to add to wishlist' };
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Remove item from wishlist
  static async removeFromWishlist(productId) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.API_URL}/api/wishlist/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message };
      } else {
        const data = await response.json();
        return { success: false, error: data.message || 'Failed to remove from wishlist' };
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Check if item is in wishlist
  static async isInWishlist(productId) {
    try {
      const result = await this.getWishlist();
      if (result.success && result.wishlist.items) {
        return result.wishlist.items.some(item => item.productId === productId.toString());
      }
      return false;
    } catch (error) {
      console.error('Check wishlist error:', error);
      return false;
    }
  }

  // Get wishlist item count
  static async getWishlistCount() {
    try {
      const result = await this.getWishlist();
      if (result.success && result.wishlist.items) {
        return result.wishlist.items.length;
      }
      return 0;
    } catch (error) {
      console.error('Get wishlist count error:', error);
      return 0;
    }
  }

  // Update item notes
  static async updateItemNotes(productId, notes) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.API_URL}/api/wishlist/items/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.message || 'Failed to update notes' };
      }
    } catch (error) {
      console.error('Update notes error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
}