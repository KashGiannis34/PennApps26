import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { AuthService } from '../services/AuthService';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = await AuthService.getStoredUser();
      if (storedUser.success) {
        setUser(storedUser.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.login({ email, password });

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        clearForm();
        Alert.alert('Success', 'Welcome back!');
      } else {
        Alert.alert('Login Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.register({
        username,
        email,
        password,
        firstName,
        lastName
      });

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        clearForm();
        Alert.alert('Success', 'Account created successfully!');
      } else {
        Alert.alert('Registration Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await AuthService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      ]
    );
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setFirstName('');
    setLastName('');
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    clearForm();
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a7c59" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* User Authentication Section */}
        <View style={styles.authSection}>
          {isAuthenticated ? (
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back, {user?.firstName || user?.username}! 👋</Text>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.wishlistButton}
                  onPress={() => navigation.navigate('Wishlist')}
                >
                  <Text style={styles.wishlistButtonText}>💚 My Wishlist</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Sign in to save your wishlist and track your sustainable journey!</Text>
              <TouchableOpacity
                style={styles.authButton}
                onPress={() => setShowAuthModal(true)}
              >
                <Text style={styles.authButtonText}>Sign In / Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>🌱 Make Your Room Sustainable</Text>
          <Text style={styles.subtitle}>
            Take a photo of your room and discover eco-friendly products to make it more sustainable!
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureTitle}>1. Capture Your Room</Text>
            <Text style={styles.featureText}>Take a photo of any room in your home</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>2. AI Analysis</Text>
            <Text style={styles.featureText}>Gemini AI analyzes your space for sustainability opportunities</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🛒</Text>
            <Text style={styles.featureTitle}>3. Product Suggestions</Text>
            <Text style={styles.featureText}>Get sustainable product recommendations from top retailers</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎨</Text>
            <Text style={styles.featureTitle}>4. Visualize Changes</Text>
            <Text style={styles.featureText}>See how your room would look with eco-friendly improvements</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.startButtonText}>📸 Start Room Analysis</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Go Sustainable?</Text>
          <Text style={styles.infoText}>
            • Reduce your environmental footprint{'\n'}
            • Save money on energy bills{'\n'}
            • Improve indoor air quality{'\n'}
            • Support eco-friendly businesses{'\n'}
            • Create a healthier living space
          </Text>
        </View>
      </View>

      {/* Authentication Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAuthModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {authMode === 'register' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Username *"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor='#757575ff'
                />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor='#757575ff'
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor='#757575ff'
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor='#757575ff'
            />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor='#757575ff'
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={authMode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={switchAuthMode}
            >
              <Text style={styles.switchModeText}>
                {authMode === 'login'
                  ? "Don't have an account? Register"
                  : "Already have an account? Sign In"
                }
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#5a7c50',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4a7c59',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#5a7c50',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#d0e7d0',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#4a6b4a',
    lineHeight: 22,
  },
  // Authentication styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f9f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4a7c59',
  },
  authSection: {
    marginBottom: 20,
  },
  userInfo: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#2d5a27',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userActions: {
    flexDirection: 'row',
    gap: 10,
  },
  wishlistButton: {
    backgroundColor: '#4a7c59',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  wishlistButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loginPrompt: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  loginPromptText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#ffffffff',
  },
  submitButton: {
    backgroundColor: '#4a7c59',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#4a7c59',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});