import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
  TextInput,
  Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WishlistService } from '../services/WishlistService';
import { AuthService } from '../services/AuthService';
import ImageViewer from '../components/ImageViewer';

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [removing, setRemoving] = useState({});
  const [editingNotes, setEditingNotes] = useState(null);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [currentImageTitle, setCurrentImageTitle] = useState(null);

  useFocusEffect(
    useCallback(() => {
      checkAuthAndLoadWishlist();
    }, [])
  );

  const checkAuthAndLoadWishlist = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        await loadWishlist();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const result = await WishlistService.getWishlist();
      if (result.success) {
        setWishlist(result.wishlist);
      } else {
        Alert.alert('Error', result.error || 'Failed to load wishlist');
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkAuthAndLoadWishlist();
  };

  const removeFromWishlist = async (item) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(prev => ({ ...prev, [item.productId]: true }));

            try {
              const result = await WishlistService.removeFromWishlist(item.productId);

              if (result.success) {
                // Remove item from local state
                setWishlist(prev => ({
                  ...prev,
                  items: prev.items.filter(wishlistItem => wishlistItem.productId !== item.productId)
                }));
              } else {
                Alert.alert('Error', result.error || 'Failed to remove item');
              }
            } catch (error) {
              console.error('Remove error:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setRemoving(prev => ({ ...prev, [item.productId]: false }));
            }
          }
        }
      ]
    );
  };

  const openProductUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
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

  const openNotesModal = (item) => {
    setEditingNotes(item);
    setNotes(item.notes || '');
    setShowNotesModal(true);
  };

  const saveNotes = async () => {
    if (!editingNotes) return;

    try {
      const result = await WishlistService.updateItemNotes(editingNotes.productId, notes);

      if (result.success) {
        // Update local state
        setWishlist(prev => ({
          ...prev,
          items: prev.items.map(item =>
            item.productId === editingNotes.productId
              ? { ...item, notes }
              : item
          )
        }));
        setShowNotesModal(false);
        setEditingNotes(null);
        setNotes('');
      } else {
        Alert.alert('Error', result.error || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Save notes error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authPromptTitle}>Sign In Required</Text>
          <Text style={styles.authPromptText}>
            Please sign in to view and manage your wishlist
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a7c59" />
        <Text style={styles.loadingText}>Loading your wishlist...</Text>
      </View>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💚</Text>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptyText}>
            Start building your sustainable wishlist by exploring product recommendations!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.exploreButtonText}>🏠 Go to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>💚 My Wishlist</Text>
        <Text style={styles.subtitle}>
          {wishlist.items.length} sustainable {wishlist.items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {wishlist.items.map((item, index) => (
        <View key={item.productId || index} style={styles.itemCard}>
          <TouchableOpacity
            style={styles.itemContent}
            onPress={() => openProductUrl(item.url)}
          >
            <TouchableOpacity
              onPress={() => openImageViewer(item.image, item.name)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                onError={() => console.log('Image load error for:', item.image)}
              />
            </TouchableOpacity>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <Text style={styles.itemSource}>📍 {item.source}</Text>
              <Text style={styles.itemRating}>
                ⭐ {item.rating} {item.reviews > 0 && `(${item.reviews} reviews)`}
              </Text>

              {item.features && item.features.length > 0 && (
                <View style={styles.itemFeatures}>
                  {item.features.slice(0, 3).map((feature, featureIndex) => (
                    <Text key={featureIndex} style={styles.itemFeature}>
                      {feature}
                    </Text>
                  ))}
                </View>
              )}

              {item.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>📝 Notes:</Text>
                  <Text style={styles.notesText} numberOfLines={2}>
                    {item.notes}
                  </Text>
                </View>
              )}

              <Text style={styles.addedDate}>
                Added {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.notesButton}
              onPress={() => openNotesModal(item)}
            >
              <Text style={styles.actionButtonText}>📝</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.removeButton, removing[item.productId] && styles.disabledButton]}
              onPress={() => removeFromWishlist(item)}
              disabled={removing[item.productId]}
            >
              {removing[item.productId] ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>🗑️</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Notes</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNotesModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {editingNotes && (
              <View style={styles.editingItemInfo}>
                <TouchableOpacity
                  onPress={() => openImageViewer(editingNotes.image, editingNotes.name)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: editingNotes.image }}
                    style={styles.editingItemImage}
                  />
                </TouchableOpacity>
                <Text style={styles.editingItemName} numberOfLines={2}>
                  {editingNotes.name}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.notesInput}
              placeholder="Add your notes about this product..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNotesModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveNotes}
              >
                <Text style={styles.saveButtonText}>Save Notes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f9f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#5a7c50',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 10,
  },
  authPromptText: {
    fontSize: 16,
    color: '#5a7c50',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    backgroundColor: '#e8f5e8',
    borderBottomWidth: 1,
    borderBottomColor: '#d0e7d0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5a7c50',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#5a7c50',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    padding: 15,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: '#4a7c59',
    fontWeight: '600',
    marginBottom: 3,
  },
  itemSource: {
    fontSize: 14,
    color: '#5a7c50',
    marginBottom: 3,
  },
  itemRating: {
    fontSize: 14,
    color: '#5a7c50',
    marginBottom: 8,
  },
  itemFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  itemFeature: {
    fontSize: 11,
    backgroundColor: '#e8f5e8',
    color: '#2d5a27',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  notesContainer: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: '#2d5a27',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 14,
    color: '#5a7c50',
  },
  addedDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    paddingTop: 0,
    gap: 10,
  },
  notesButton: {
    backgroundColor: '#4a7c59',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  editingItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  editingItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  editingItemName: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 120,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4a7c59',
    paddingVertical: 15,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});