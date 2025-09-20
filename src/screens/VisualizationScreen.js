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
import ImageViewer from '../components/ImageViewer';

export default function VisualizationScreen({ route, navigation }) {
  const { analysis, photoUri, photoBase64 } = route.params;
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [availableProducts, setAvailableProducts] = useState(analysis?.products || []);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [currentImageTitle, setCurrentImageTitle] = useState(null);

  const addProductToSelection = (product) => {
    if (!selectedProducts.find(p => p.name === product.name)) {
      setSelectedProducts([...selectedProducts, product]);
      setAvailableProducts(availableProducts.filter(p => p.name !== product.name));
    }
  };

  const removeProductFromSelection = (product) => {
    setSelectedProducts(selectedProducts.filter(p => p.name !== product.name));
    setAvailableProducts([...availableProducts, product]);
  };

  const generateVisualization = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert(
        'No Products Selected',
        'Please select at least one product to add to your room visualization.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      setGeneratedImageUrl(null);

      const result = await GeminiService.generateRoomVisualization(
        selectedProducts,
        photoBase64
      );

      if (result.success && result.data) {
        // Convert base64 to data URI for display
        const imageUri = `data:${result.mimeType};base64,${result.data}`;
        setGeneratedImageUrl(imageUri);
      } else {
        console.warn('No image generated:', result.error);
        Alert.alert(
          'Generation Failed',
          'We couldn\'t generate your room visualization. Please try again.',
          [{ text: 'OK' }]
        );
      }

      setLoading(false);

    } catch (error) {
      console.error('Visualization generation error:', error);
      setLoading(false);
      Alert.alert(
        'Error',
        'An error occurred while generating your visualization. Please try again.',
        [{ text: 'OK' }]
      );
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

  const openImageViewer = (imageUri, title) => {
    setCurrentImageUri(imageUri);
    setCurrentImageTitle(title);
    setImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setImageViewerVisible(false);
    setCurrentImageUri(null);
    setCurrentImageTitle(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Customize Your Sustainable Room</Text>
        <Text style={styles.subtitle}>
          Select products to add to your room visualization
        </Text>
      </View>

      <View style={styles.comparisonContainer}>
        <View style={styles.imageSection}>
          <Text style={styles.imageLabel}>📸 Your Current Room</Text>
          <TouchableOpacity onPress={() => openImageViewer(photoUri, 'Your Current Room')}>
            <Image source={{ uri: photoUri }} style={styles.roomImage} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#4a7c59" />
            <Text style={styles.loadingText}>🎨 Creating your sustainable vision...</Text>
            <Text style={styles.loadingSubtext}>
              Generating visualization with selected products
            </Text>
          </View>
        ) : generatedImageUrl ? (
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>🌱 Your Sustainable Vision</Text>
            <TouchableOpacity onPress={() => openImageViewer(generatedImageUrl, 'Your Sustainable Vision')}>
              <Image source={{ uri: generatedImageUrl }} style={styles.roomImage} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.fallbackSection}>
            <Text style={styles.imageLabel}>🌱 Your Sustainable Vision</Text>
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackText}>🎨</Text>
              <Text style={styles.fallbackTitle}>Select Products Below</Text>
              <Text style={styles.fallbackSubtext}>
                Choose products to add to your room, then tap "Generate Visualization"
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Selected Products Section */}
      <View style={styles.selectedSection}>
        <Text style={styles.sectionTitle}>
          🌟 Selected Products ({selectedProducts.length})
        </Text>
        {selectedProducts.length > 0 ? (
          selectedProducts.map((product, index) => (
            <TouchableOpacity
              key={index}
              style={styles.selectedProductCard}
              onPress={() => removeProductFromSelection(product)}
            >
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.priceRange}</Text>
                <Text style={styles.productReason}>{product.reason}</Text>
              </View>
              <Text style={styles.removeButton}>✕</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptySelection}>
            <Text style={styles.emptyText}>No products selected yet</Text>
            <Text style={styles.emptySubtext}>Tap products below to add them</Text>
          </View>
        )}
      </View>

      {/* Generate Button */}
      {selectedProducts.length > 0 && (
        <View style={styles.generateSection}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateVisualization}
            disabled={loading}
          >
            <Text style={styles.generateButtonText}>
              {loading ? 'Generating...' : '🎨 Generate Visualization'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Available Products Section */}
      <View style={styles.availableSection}>
        <Text style={styles.sectionTitle}>
          🛒 Available Products ({availableProducts.length})
        </Text>
        {availableProducts.map((product, index) => (
          <TouchableOpacity
            key={index}
            style={styles.availableProductCard}
            onPress={() => addProductToSelection(product)}
          >
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.priceRange}</Text>
              <Text style={styles.productReason}>{product.reason}</Text>
            </View>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={viewProductsAgain}>
          <Text style={styles.secondaryButtonText}>🛒 View All Product Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tertiaryButton} onPress={startOver}>
          <Text style={styles.tertiaryButtonText}>🏠 Analyze Another Room</Text>
        </TouchableOpacity>
      </View>

      <ImageViewer
        visible={imageViewerVisible}
        imageUri={currentImageUri}
        title={currentImageTitle}
        onClose={closeImageViewer}
      />
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
  selectedSection: {
    margin: 20,
    marginTop: 0,
  },
  availableSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 15,
  },
  selectedProductCard: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4a7c59',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  availableProductCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d0e7d0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 3,
  },
  productPrice: {
    fontSize: 14,
    color: '#4a7c59',
    fontWeight: '600',
    marginBottom: 5,
  },
  productReason: {
    fontSize: 12,
    color: '#5a7c50',
  },
  addButton: {
    fontSize: 24,
    color: '#4a7c59',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  removeButton: {
    fontSize: 20,
    color: '#d32f2f',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  emptySelection: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#d0e7d0',
  },
  emptyText: {
    fontSize: 16,
    color: '#5a7c50',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8a8a8a',
    marginTop: 5,
  },
  generateSection: {
    margin: 20,
    marginTop: 0,
  },
  generateButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  actionButtons: {
    padding: 20,
    gap: 15,
    paddingBottom: 40,
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