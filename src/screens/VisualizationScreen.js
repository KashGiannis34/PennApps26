import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { GeminiService } from '../services/GeminiService';

export default function VisualizationScreen({ route, navigation }) {
  const { analysis, photoUri, photoBase64 } = route.params;
  const [loading, setLoading] = useState(true);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [visualizationText, setVisualizationText] = useState('');

  useEffect(() => {
    generateVisualization();
  }, []);

  const generateVisualization = async () => {
    try {
      setLoading(true);

      // Generate visualization using Gemini
      const products = analysis?.products || [];

      const result = await GeminiService.generateRoomVisualization(
        products,
        photoBase64
      );

      if (result.success && result.data) {
        // Convert base64 to data URI for display
        const imageUri = `data:${result.mimeType};base64,${result.data}`;
        setGeneratedImageUrl(imageUri);
        setVisualizationText("Your room has been transformed with sustainable improvements! The visualization shows how your space could look with eco-friendly products that reduce energy consumption, improve air quality, and create a healthier living environment.");
      } else {
        console.warn('No image generated:', result.error);
        setGeneratedImageUrl(null);
        setVisualizationText("We weren't able to generate a visual transformation this time, but the suggested products below will help make your room more sustainable and eco-friendly.");
      }

      setLoading(false);

    } catch (error) {
      console.error('Visualization generation error:', error);
      setLoading(false);
      setGeneratedImageUrl(null);
    }
  };

  const shareVisualization = () => {
    Alert.alert(
      'Share Your Vision',
      'Feature coming soon! You\'ll be able to share your sustainable room visualization on social media and with friends.',
      [{ text: 'OK' }]
    );
  };

  const startOver = () => {
    navigation.navigate('Home');
  };

  const viewProductsAgain = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Your Sustainable Room Vision</Text>
        <Text style={styles.subtitle}>
          See how your space could look with eco-friendly improvements
        </Text>
      </View>

      <View style={styles.comparisonContainer}>
        <View style={styles.imageSection}>
          <Text style={styles.imageLabel}>📸 Your Current Room</Text>
          <Image source={{ uri: photoUri }} style={styles.roomImage} />
        </View>

        {loading ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#4a7c59" />
            <Text style={styles.loadingText}>🎨 Creating your sustainable vision...</Text>
            <Text style={styles.loadingSubtext}>
              Generating visualization with eco-friendly improvements
            </Text>
          </View>
        ) : generatedImageUrl ? (
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>🌱 Your Sustainable Vision</Text>
            <Image source={{ uri: generatedImageUrl }} style={styles.roomImage} />
          </View>
        ) : (
          <View style={styles.fallbackSection}>
            <Text style={styles.imageLabel}>🌱 Your Sustainable Vision</Text>
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackText}>🎨</Text>
              <Text style={styles.fallbackTitle}>Visualization Coming Soon</Text>
              <Text style={styles.fallbackSubtext}>
                Check out the recommended products below to start making your room more sustainable!
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>✨ Your Transformation</Text>
        <Text style={styles.descriptionText}>{visualizationText}</Text>
      </View>

      {analysis && (
        <View style={styles.impactContainer}>
          <Text style={styles.impactTitle}>🌍 Environmental Impact</Text>

          <View style={styles.impactCard}>
            <Text style={styles.impactValue}>{analysis.sustainabilityScore}/10</Text>
            <Text style={styles.impactLabel}>Sustainability Score</Text>
          </View>

          <View style={styles.benefitsList}>
            <Text style={styles.benefitsTitle}>Expected Benefits:</Text>
            <Text style={styles.benefitItem}>💰 {analysis.potentialSavings}</Text>
            <Text style={styles.benefitItem}>🔋 Reduced energy consumption</Text>
            <Text style={styles.benefitItem}>🌱 Improved air quality</Text>
            <Text style={styles.benefitItem}>♻️ Lower environmental footprint</Text>
            <Text style={styles.benefitItem}>🏡 Healthier living space</Text>
          </View>
        </View>
      )}

      <View style={styles.recommendedProducts}>
        <Text style={styles.recommendedTitle}>🛒 Key Sustainable Products</Text>
        {(analysis?.products || []).slice(0, 3).map((product, index) => (
          <View key={index} style={styles.productSummary}>
            <Text style={styles.productSummaryName}>{product.name}</Text>
            <Text style={styles.productSummaryBenefit}>{product.benefits}</Text>
            <Text style={styles.productSummaryPrice}>{product.priceRange}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={shareVisualization}>
          <Text style={styles.primaryButtonText}>📱 Share Your Vision</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={viewProductsAgain}>
          <Text style={styles.secondaryButtonText}>🛒 View Products Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tertiaryButton} onPress={startOver}>
          <Text style={styles.tertiaryButtonText}>🏠 Analyze Another Room</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#e8f5e8',
    borderBottomWidth: 1,
    borderBottomColor: '#d0e7d0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#5a7c50',
    textAlign: 'center',
  },
  comparisonContainer: {
    padding: 20,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 10,
    textAlign: 'center',
  },
  roomImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  loadingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginTop: 15,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#5a7c50',
    textAlign: 'center',
    marginTop: 5,
  },
  fallbackSection: {
    marginBottom: 20,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#d0e7d0',
    borderStyle: 'dashed',
  },
  fallbackText: {
    fontSize: 48,
    marginBottom: 10,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 5,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#5a7c50',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#5a7c50',
    lineHeight: 20,
  },
  impactContainer: {
    backgroundColor: '#e8f5e8',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4a7c59',
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
    marginBottom: 15,
  },
  impactCard: {
    alignItems: 'center',
    marginBottom: 15,
  },
  impactValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4a7c59',
  },
  impactLabel: {
    fontSize: 14,
    color: '#2d5a27',
  },
  benefitsList: {
    marginTop: 10,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#5a7c50',
    marginBottom: 4,
  },
  recommendedProducts: {
    margin: 20,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 15,
  },
  productSummary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4a7c59',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productSummaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  productSummaryBenefit: {
    fontSize: 12,
    color: '#5a7c50',
    marginVertical: 2,
  },
  productSummaryPrice: {
    fontSize: 14,
    color: '#4a7c59',
    fontWeight: '600',
  },
  actionButtons: {
    padding: 20,
    gap: 15,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a7c59',
  },
  secondaryButtonText: {
    color: '#4a7c59',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tertiaryButton: {
    backgroundColor: '#e8f5e8',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: '#2d5a27',
    fontSize: 14,
    fontWeight: '600',
  },
});