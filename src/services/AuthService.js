import { NetworkConfig } from '../config/NetworkConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
  static get API_URL() {
    return NetworkConfig.getServerUrl();
  }

  // Store token in AsyncStorage
  static async storeToken(token) {
    try {
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Get token from AsyncStorage
  static async getToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Remove token from AsyncStorage
  static async removeToken() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userProfile');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Store user profile
  static async storeUserProfile(user) {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user profile:', error);
    }
  }

  // Get user profile
  static async getUserProfile() {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      return userProfile ? JSON.parse(userProfile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Register new user
  static async register(userData) {
    try {
      const response = await fetch(`${this.API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      // Get the raw response text first
      const responseText = await response.text();
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response was not valid JSON:', responseText);
        return {
          success: false,
          error: `Server returned invalid response. Status: ${response.status}. Response: ${responseText.substring(0, 200)}...`
        };
      }

      if (response.ok && data.success) {
        await this.storeToken(data.data.token);
        await this.storeUserProfile(data.data.user);
        return { success: true, user: data.data.user, token: data.data.token };
      } else {
        // Handle validation errors with specific details
        let errorMessage = data.message || 'Registration failed';

        if (data.errors && Array.isArray(data.errors)) {
          // If there are specific validation errors, show them
          errorMessage = data.errors.join('\n');
        }

        return { success: false, error: errorMessage, validationErrors: data.errors };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  // Login user
  static async login(credentials) {
    try {
      console.log('Logging in user with API URL:', this.API_URL);
      console.log('Login credentials:', { ...credentials, password: '[HIDDEN]' });

      const response = await fetch(`${this.API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);

      // Get the raw response text first
      const responseText = await response.text();
      console.log('Login raw response:', responseText);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Login JSON parse error:', parseError);
        console.error('Response was not valid JSON:', responseText);
        return {
          success: false,
          error: `Server returned invalid response. Status: ${response.status}. Response: ${responseText.substring(0, 200)}...`
        };
      }

      if (response.ok && data.success) {
        await this.storeToken(data.data.token);
        await this.storeUserProfile(data.data.user);
        return { success: true, user: data.data.user, token: data.data.token };
      } else {
        // Handle validation errors with specific details
        let errorMessage = data.message || 'Login failed';

        if (data.errors && Array.isArray(data.errors)) {
          // If there are specific validation errors, show them
          errorMessage = data.errors.join('\n');
        }

        return { success: false, error: errorMessage, validationErrors: data.errors };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  // Get current user profile from server
  static async getProfile() {
    try {
      const token = await this.getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await fetch(`${this.API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await this.storeUserProfile(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        if (response.status === 401) {
          await this.removeToken(); // Token is invalid
        }
        return { success: false, error: data.message || 'Failed to get profile' };
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Logout user
  static async logout() {
    await this.removeToken();
    return { success: true };
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    const token = await this.getToken();
    if (!token) return false;

    // Try to get profile to verify token is still valid
    const profileResult = await this.getProfile();
    return profileResult.success;
  }

  // Get stored user data without server call
  static async getStoredUser() {
    const token = await this.getToken();
    const profile = await this.getUserProfile();

    if (token && profile) {
      return { success: true, user: profile, token };
    }

    return { success: false };
  }
}