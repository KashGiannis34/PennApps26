import { NetworkConfig } from '../config/NetworkConfig';
import { AuthService } from './AuthService';

export class GreenovationsService {
  static get API_URL() {
    return NetworkConfig.getServerUrl();
  }

  // Get user's greenovations
  static async getGreenovations() {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.API_URL}/api/greenovations/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, greenovations: data.data.greenovations };
      } else {
        return { success: false, error: data.message || 'Failed to fetch greenovations' };
      }
    } catch (error) {
      console.error('Greenovations fetch error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Save new greenovation
  static async saveGreenovation(greenovationData) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.API_URL}/api/greenovations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(greenovationData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, greenovation: data.data.greenovation };
      } else {
        return { success: false, error: data.message || 'Failed to save greenovation' };
      }
    } catch (error) {
      console.error('Save greenovation error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Get single greenovation
  static async getGreenovation(id) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.API_URL}/api/greenovations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, greenovation: data.data.greenovation };
      } else {
        return { success: false, error: data.message || 'Greenovation not found' };
      }
    } catch (error) {
      console.error('Get greenovation error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Update greenovation
  static async updateGreenovation(id, updates) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.API_URL}/api/greenovations/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, greenovation: data.data.greenovation };
      } else {
        return { success: false, error: data.message || 'Failed to update greenovation' };
      }
    } catch (error) {
      console.error('Update greenovation error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Delete greenovation
  static async deleteGreenovation(id) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.API_URL}/api/greenovations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.message || 'Failed to delete greenovation' };
      }
    } catch (error) {
      console.error('Delete greenovation error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
}