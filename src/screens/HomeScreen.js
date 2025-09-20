import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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
});