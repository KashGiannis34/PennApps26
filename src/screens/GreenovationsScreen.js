import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GreenovationsService } from '../services/GreenovationsService';
import { AuthService } from '../services/AuthService';
import ImageViewer from '../components/ImageViewer';

const { width: screenWidth } = Dimensions.get('window');

export default function GreenovationsScreen({ navigation }) {
  const [greenovations, setGreenovations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deleting, setDeleting] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [currentImageTitle, setCurrentImageTitle] = useState(null);

  useFocusEffect(
    useCallback(() => {
      checkAuthAndLoadGreenovations();
    }, [])
  );

  const checkAuthAndLoadGreenovations = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        await loadGreenovations();
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const loadGreenovations = async () => {
    try {
      const result = await GreenovationsService.getGreenovations();
      if (result.success) {
        setGreenovations(result.greenovations);
      } else {
        Alert.alert('Error', result.error || 'Failed to load greenovations');
      }
    } catch (error) {
      console.error('Error loading greenovations:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkAuthAndLoadGreenovations();
  };

  const deleteGreenovation = async (item) => {
    Alert.alert(
      'Delete Transformation',
      `Delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(prev => ({ ...prev, [item._id]: true }));

            try {
              const result = await GreenovationsService.deleteGreenovation(item._id);

              if (result.success) {
                setGreenovations(prev => prev.filter(g => g._id !== item._id));
                Alert.alert('Success', 'Transformation deleted successfully');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete transformation');
              }
            } catch (error) {
              console.error('Error deleting greenovation:', error);
              Alert.alert('Error', 'An error occurred while deleting');
            } finally {
              setDeleting(prev => ({ ...prev, [item._id]: false }));
            }
          }
        }
      ]
    );
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditNotes(item.notes || '');
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    try {
      const updates = {
        name: editName,
        description: editDescription,
        notes: editNotes
      };

      const result = await GreenovationsService.updateGreenovation(editingItem._id, updates);

      if (result.success) {
        setGreenovations(prev =>
          prev.map(item =>
            item._id === editingItem._id
              ? { ...item, ...updates }
              : item
          )
        );
        setShowEditModal(false);
        Alert.alert('Success', 'Transformation updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to update transformation');
      }
    } catch (error) {
      console.error('Error updating greenovation:', error);
      Alert.alert('Error', 'An error occurred while updating');
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

  const renderGreenovation = (item) => (
    <View key={item._id} style={styles.transformationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.transformationTitle}>{item.name}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteGreenovation(item)}
            disabled={deleting[item._id]}
          >
            {deleting[item._id] ? (
              <ActivityIndicator size="small" color="#ff4757" />
            ) : (
              <Text style={styles.deleteButtonText}>🗑️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.transformationDescription}>{item.description}</Text>

      {item.notes && (
        <Text style={styles.transformationNotes}>📝 {item.notes}</Text>
      )}

      <View style={styles.imagesContainer}>
        <View style={styles.imageSection}>
          <Text style={styles.imageLabel}>Before</Text>
          <TouchableOpacity
            onPress={() => openImageViewer(item.originalImage, `${item.name} - Before`)}
          >
            <Image
              source={{ uri: item.originalImage }}
              style={styles.transformationImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.imageLabel}>After</Text>
          <TouchableOpacity
            onPress={() => openImageViewer(item.generatedImage, `${item.name} - After`)}
          >
            <Image
              source={{ uri: item.generatedImage }}
              style={styles.transformationImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.transformationDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Loading your transformations...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Please log in to view your transformations</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.authButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Room Transformations</Text>
          <Text style={styles.subtitle}>
            {greenovations.length} sustainable makeover{greenovations.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {greenovations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No transformations yet</Text>
            <Text style={styles.emptySubtitle}>
              Take a photo of your room and create your first sustainable transformation!
            </Text>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => navigation.navigate('Camera')}
            >
              <Text style={styles.cameraButtonText}>📸 Take Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          greenovations.map(renderGreenovation)
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Transformation</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Transformation name"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Description"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Add your notes..."
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Viewer */}
      <ImageViewer
        visible={imageViewerVisible}
        imageUri={currentImageUri}
        title={currentImageTitle}
        onClose={closeImageViewer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  authText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
  },
  transformationCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transformationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f7fafc',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f7fafc',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  transformationDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 10,
  },
  transformationNotes: {
    fontSize: 14,
    color: '#4a5568',
    backgroundColor: '#f7fafc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageSection: {
    flex: 1,
    marginHorizontal: 5,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
    textAlign: 'center',
  },
  transformationImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  transformationDate: {
    fontSize: 12,
    color: '#a0aec0',
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#718096',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
    marginTop: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});