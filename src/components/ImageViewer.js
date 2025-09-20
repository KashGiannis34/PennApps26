import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ImageViewer({ visible, imageUri, onClose, title }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  // Reset state when image changes or modal opens
  React.useEffect(() => {
    if (visible && imageUri) {
      setImageLoading(true);
      setImageError(false);
      setZoomScale(1);
      setRetryCount(0);
    }
  }, [visible, imageUri]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (error) => {

    // Check if data URI is properly formatted
    if (imageUri?.startsWith('data:')) {
      const hasBase64 = imageUri.includes('base64,');
      const mimeType = imageUri.split(';')[0].replace('data:', '');
    }

    setImageLoading(false);
    setImageError(true);
  };

  const handleZoomStateChange = (event) => {
    setZoomScale(event.nativeEvent.zoomScale);
  };

  const retryImageLoad = () => {
    if (retryCount < 2) {
      setRetryCount(retryCount + 1);
      setImageLoading(true);
      setImageError(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          {title && (
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
            </View>
          )}
        </View>

        {/* Image container */}
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a7c59" />
              <Text style={styles.loadingText}>Loading image...</Text>
            </View>
          )}

          {imageError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>🖼️</Text>
              <Text style={styles.errorText}>Failed to load image</Text>
              <Text style={styles.errorSubtext}>URI: {imageUri?.substring(0, 60)}...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              maximumZoomScale={imageUri?.startsWith('data:') ? 3 : 5}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              onZoomStateChange={handleZoomStateChange}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
                key={`${imageUri}_${visible}`} // Force re-render when URI or visibility changes
              />
            </ScrollView>
          )}
        </View>

        {/* Footer with zoom info */}
        <View style={styles.footer}>
          <Text style={styles.zoomText}>
            Pinch to zoom • {Math.round(zoomScale * 100)}%
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: screenWidth - 40,
    height: screenHeight - 200,
    maxWidth: screenWidth - 40,
    maxHeight: screenHeight - 200,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#ffffff80',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  zoomText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
});