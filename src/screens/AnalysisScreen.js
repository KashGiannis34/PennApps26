import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { GeminiService } from '../services/GeminiService';

export default function AnalysisScreen({ route, navigation }) {
  const { photoUri, photoBase64 } = route.params;
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await GeminiService.analyzeRoomImage(photoBase64);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewProducts = () => {
    navigation.navigate('Products', { 
      products: analysis.products,
      analysis: analysis
    });
  };

  const createVisualization = () => {
    navigation.navigate('Visualization', {
      analysis: analysis,
      photoUri: photoUri
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={{ uri: photoUri }} style={styles.analysisImage} />
        <ActivityIndicator size="large" color="#4a7c59" style={styles.loader} />
        <Text style={styles.loadingText}>🤖 AI is analyzing your room...</Text>
        <Text style={styles.loadingSubtext}>
          Looking for sustainability opportunities and eco-friendly improvements
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={analyzeImage}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.roomImage} />
      
      <View style={styles.analysisContainer}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Sustainability Score</Text>
          <Text style={styles.scoreValue}>{analysis.sustainabilityScore}/10</Text>
          <Text style={styles.savingsText}>💰 {analysis.potentialSavings}</Text>
        </View>

        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>🔍 Room Analysis</Text>
          <Text style={styles.analysisText}>{analysis.analysis}</Text>
        </View>

        <View style={styles.productsPreview}>
          <Text style={styles.productsTitle}>
            🌱 {analysis.products.length} Sustainable Products Found
          </Text>
          
          {analysis.products.slice(0, 3).map((product, index) => (
            <View key={index} style={styles.productPreviewCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.priceRange}</Text>
              </View>
              <Text style={styles.productReason}>{product.reason}</Text>
            </View>
          ))}
          
          {analysis.products.length > 3 && (
            <Text style={styles.moreProductsText}>
              +{analysis.products.length - 3} more products available
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={viewProducts}>
            <Text style={styles.primaryButtonText}>🛒 View All Products</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={createVisualization}>
            <Text style={styles.secondaryButtonText}>🎨 Visualize Changes</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f9f5',
    padding: 20,
  },
  analysisImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 30,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#5a7c50',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  analysisContainer: {
    padding: 20,
  },
  scoreCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4a7c59',
  },
  scoreTitle: {
    fontSize: 16,
    color: '#2d5a27',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4a7c59',
  },
  savingsText: {
    fontSize: 16,
    color: '#2d5a27',
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 10,
  },
  analysisText: {
    fontSize: 14,
    color: '#5a7c50',
    lineHeight: 20,
  },
  productsPreview: {
    marginBottom: 20,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 15,
  },
  productPreviewCard: {
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    color: '#4a7c59',
    fontWeight: '600',
  },
  productReason: {
    fontSize: 12,
    color: '#5a7c50',
  },
  moreProductsText: {
    fontSize: 14,
    color: '#4a7c59',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  actionButtons: {
    gap: 15,
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
});