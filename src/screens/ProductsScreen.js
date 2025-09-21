import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { ProductService } from '../services/ProductService';
import { AuthService } from '../services/AuthService';
import { WishlistService } from '../services/WishlistService';
import ImageViewer from '../components/ImageViewer';

export default function ProductsScreen({ route, navigation }) {
  const { products, analysis } = route.params;
  const [productListings, setProductListings] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState({});
  const [fetchedProducts, setFetchedProducts] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [currentImageTitle, setCurrentImageTitle] = useState(null);

  // Helper function to get product ID from listing
  const getProductId = (listing) => {
    // Use the actual ID from the listing (from API result)
    return listing.id?.toString() || `fallback_${Date.now()}_${Math.random()}`;
  };

  useEffect(() => {
    checkAuthAndLoadWishlist();
  }, []);

  // Clear local state when new products are loaded (new image analysis)
  useEffect(() => {
    const analysisId = route.params.photoUri || route.params.photoBase64 || Date.now().toString();

    if (currentAnalysisId && currentAnalysisId !== analysisId) {
      // New analysis detected, clear the local product state but keep wishlist
      setWishlistLoading({});
      setProductListings({});
      setFetchedProducts({});
      setExpandedProduct(null);

      // Reload wishlist to ensure it's up to date
      if (isAuthenticated) {
        checkAuthAndLoadWishlist();
      }
    }

    setCurrentAnalysisId(analysisId);
  }, [products, route.params.photoUri, route.params.photoBase64]);

  const checkAuthAndLoadWishlist = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const wishlistResult = await WishlistService.getWishlist();
        if (wishlistResult.success) {
          // Create a set of product IDs that are in the wishlist
          const wishlistProductIds = new Set();

          wishlistResult.wishlist.items.forEach(item => {
            // Add both the stored productId and the original listing ID
            if (item.productId) {
              wishlistProductIds.add(item.productId);
            }
            if (item.id) {
              wishlistProductIds.add(item.id.toString());
            }
          });

          setWishlistItems(wishlistProductIds);
        }
      }
    } catch (error) {
      console.error('Error checking auth and loading wishlist:', error);
    }
  };

  const fetchProductListings = async (productName, product) => {
    // Don't fetch if already fetched or currently loading
    if (fetchedProducts[productName] || loadingProducts[productName]) {
      return;
    }

    setLoadingProducts(prev => ({ ...prev, [productName]: true }));

    try {
      console.log(`Fetching listings for: ${productName}`);
      const results = await ProductService.searchProducts(
        product.searchKeywords,
        product.name
      );

      setProductListings(prev => ({ ...prev, [productName]: results }));
      setFetchedProducts(prev => ({ ...prev, [productName]: true }));
    } catch (error) {
      console.error(`Error fetching listings for ${productName}:`, error);
      setProductListings(prev => ({ ...prev, [productName]: [] }));
      setFetchedProducts(prev => ({ ...prev, [productName]: true }));
    } finally {
      setLoadingProducts(prev => ({ ...prev, [productName]: false }));
    }
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

  const toggleProductExpansion = async (productName, product) => {
    if (expandedProduct === productName) {
      // Collapse the product
      setExpandedProduct(null);
    } else {
      // Expand the product and fetch listings if not already fetched
      setExpandedProduct(productName);
      if (!fetchedProducts[productName]) {
        await fetchProductListings(productName, product);
      }
    }
  };

  const addToWishlist = async (listing) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to add items to your wishlist',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Home') }
        ]
      );
      return;
    }

    // Use the productId that was passed in or get it from the listing
    const productId = listing.productId || getProductId(listing);

    if (wishlistItems.has(productId)) {
      Alert.alert('Already in Wishlist', 'This item is already in your wishlist');
      return;
    }

    setWishlistLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const result = await WishlistService.addToWishlist({
        ...listing,
        id: productId,
        productId: productId
      });

      if (result.success) {
        setWishlistItems(prev => new Set([...prev, productId]));
        Alert.alert('Success', 'Item added to your wishlist!');
      } else {
        Alert.alert('Error', result.error || 'Failed to add item to wishlist');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Add to wishlist error:', error);
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeFromWishlist = async (listing) => {
    // Use the productId that was passed in
    const productId = listing.productId || listing.id?.toString();

    if (!productId || !wishlistItems.has(productId)) {
      return;
    }

    setWishlistLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const result = await WishlistService.removeFromWishlist(productId);

      if (result.success) {
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        Alert.alert('Removed', 'Item removed from your wishlist');
      } else {
        Alert.alert('Error', result.error || 'Failed to remove item from wishlist');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Remove from wishlist error:', error);
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const renderProduct = (product, cardIndex) => {
    const listings = productListings[product.name] || [];
    const isExpanded = expandedProduct === product.name;
    const isLoadingThisProduct = loadingProducts[product.name];
    const hasFetchedThisProduct = fetchedProducts[product.name];

    return (
      <View key={cardIndex} style={styles.productCard}>
        <TouchableOpacity
          style={styles.productHeader}
          onPress={() => toggleProductExpansion(product.name, product)}
        >
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productType}>{product.type}</Text>
            <Text style={styles.productPrice}>{product.priceRange}</Text>
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.productReason}>{product.reason}</Text>
        <Text style={styles.productBenefits}>💚 {product.benefits}</Text>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.searchLinksContainer}>
              <Text style={styles.searchLinksTitle}>🔍 Quick Search Links:</Text>
              <View style={styles.searchLinks}>
                {ProductService.getSearchUrls(product.searchKeywords).amazon && (
                  <TouchableOpacity
                    style={[styles.searchButton, styles.amazonButton]}
                    onPress={() => openProductUrl(ProductService.getSearchUrls(product.searchKeywords).amazon)}
                  >
                    <Text style={styles.searchButtonText}>Amazon</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.searchButton, styles.ebayButton]}
                  onPress={() => openProductUrl(ProductService.getSearchUrls(product.searchKeywords).ebay)}
                >
                  <Text style={styles.searchButtonText}>eBay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.searchButton, styles.googleButton]}
                  onPress={() => openProductUrl(ProductService.getSearchUrls(product.searchKeywords).google)}
                >
                  <Text style={styles.searchButtonText}>Google</Text>
                </TouchableOpacity>
              </View>
            </View>

            {!hasFetchedThisProduct ? (
              <View style={styles.fetchPromptContainer}>
                <TouchableOpacity
                  style={styles.fetchButton}
                  onPress={() => fetchProductListings(product.name, product)}
                  disabled={isLoadingThisProduct}
                >
                  {isLoadingThisProduct ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.fetchButtonText}>Finding Products...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.fetchButtonIcon}>🔍</Text>
                      <Text style={styles.fetchButtonText}>Find Available Products</Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text style={styles.fetchPromptText}>
                  Tap to search for this product across multiple retailers
                </Text>
              </View>
            ) : listings.length > 0 ? (
              <View style={styles.listingsContainer}>
                <Text style={styles.listingsTitle}>🛒 Available Products:</Text>
                {listings.map((listing, listingIndex) => {
                  // Use the actual product ID from the listing
                  const productId = getProductId(listing);
                  console.log('Using product ID:', productId, 'for listing:', listing.name);
                  const isInWishlist = wishlistItems.has(productId);
                  const isWishlistLoading = wishlistLoading[productId];

                  return (
                    <View key={listingIndex} style={styles.listingCardContainer}>
                      <TouchableOpacity
                        style={styles.listingCard}
                        onPress={() => openProductUrl(listing.url)}
                      >
                        <TouchableOpacity
                          onPress={() => openImageViewer(listing.image, listing.name)}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{ uri: listing.image }}
                            style={styles.listingImage}
                            onError={() => console.log('Image load error for:', listing.image)}
                          />
                        </TouchableOpacity>
                        <View style={styles.listingInfo}>
                          <Text style={styles.listingName} numberOfLines={2}>
                            {listing.name}
                          </Text>
                          <Text style={styles.listingPrice}>{listing.price}</Text>
                          <Text style={styles.listingSource}>📍 {listing.source}</Text>
                          <Text style={styles.listingRating}>
                            ⭐ {listing.rating} {listing.reviews > 0 && `(${listing.reviews} reviews)`}
                          </Text>
                          <Text style={styles.listingShipping} numberOfLines={1}>
                            {listing.shipping}
                          </Text>
                          {listing.features && listing.features.length > 0 && (
                            <View style={styles.listingFeatures}>
                              {listing.features.slice(0, 2).map((feature, featureIndex) => (
                                <Text key={featureIndex} style={styles.listingFeature}>
                                  {feature}
                                </Text>
                              ))}
                            </View>
                          )}
                          {!listing.inStock && (
                            <Text style={styles.outOfStock}>⚠️ Limited Stock</Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Wishlist Button */}
                      <TouchableOpacity
                        style={[
                          styles.wishlistButton,
                          isInWishlist ? styles.wishlistButtonActive : styles.wishlistButtonInactive
                        ]}
                        onPress={() => isInWishlist ?
                          removeFromWishlist({ ...listing, id: productId, productId: productId }) :
                          addToWishlist({ ...listing, id: productId, productId: productId })
                        }
                        disabled={isWishlistLoading}
                      >
                        {isWishlistLoading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.wishlistButtonText}>
                            {isInWishlist ? '💚' : '🤍'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noListingsContainer}>
                <Text style={styles.noListingsText}>No products found</Text>
                <Text style={styles.noListingsSubtext}>
                  Try the search links above to find this product manually
                </Text>
              </View>
            )}

            <View style={styles.keywordsContainer}>
              <Text style={styles.keywordsTitle}>🏷️ Search Keywords:</Text>
              <View style={styles.keywords}>
                {product.searchKeywords.map((keyword, keywordIndex) => (
                  <Text key={keywordIndex} style={styles.keyword}>
                    {keyword}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };



  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Sustainable Products for Your Room</Text>
        <Text style={styles.subtitle}>
          {products.length} eco-friendly recommendations • {analysis.potentialSavings}
        </Text>
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.wishlistNavButton}
            onPress={() => navigation.navigate('Wishlist')}
          >
            <Text style={styles.wishlistNavButtonText}>My Wishlist</Text>
          </TouchableOpacity>
        )}
      </View>

      {products.map((product, cardIndex) => renderProduct(product, cardIndex))}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.visualizeButton}
          onPress={() => navigation.navigate('Visualization', {
            analysis,
            photoUri: route.params.photoUri,
            photoBase64: route.params.photoBase64
          })}
        >
          <Text style={styles.visualizeButtonText}>🎨 Visualize Your Green Room</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#5a7c50',
    textAlign: 'center',
    marginBottom: 15,
  },
  wishlistNavButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  wishlistNavButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  productType: {
    fontSize: 14,
    color: '#4a7c59',
    fontStyle: 'italic',
  },
  productPrice: {
    fontSize: 16,
    color: '#2d5a27',
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 20,
    color: '#4a7c59',
  },
  productReason: {
    fontSize: 14,
    color: '#5a7c50',
    marginBottom: 5,
  },
  productBenefits: {
    fontSize: 14,
    color: '#2d5a27',
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  searchLinksContainer: {
    marginBottom: 15,
  },
  searchLinksTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 8,
  },
  searchLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  searchButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  amazonButton: {
    backgroundColor: '#ff9900',
  },
  ebayButton: {
    backgroundColor: '#0064d2',
  },
  googleButton: {
    backgroundColor: '#4285f4',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fetchPromptContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#e8f5e8',
    borderStyle: 'dashed',
  },
  fetchButton: {
    backgroundColor: '#4a7c59',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fetchButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  fetchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  fetchPromptText: {
    fontSize: 12,
    color: '#5a7c50',
    textAlign: 'center',
    lineHeight: 16,
  },
  listingsContainer: {
    marginBottom: 15,
  },
  listingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 10,
  },
  listingCardContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingRight: 50, // Make room for wishlist button
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  listingInfo: {
    flex: 1,
    marginLeft: 10,
  },
  listingName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  listingPrice: {
    fontSize: 14,
    color: '#4a7c59',
    fontWeight: '600',
  },
  listingSource: {
    fontSize: 12,
    color: '#5a7c50',
  },
  listingRating: {
    fontSize: 12,
    color: '#5a7c50',
  },
  listingShipping: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
  listingFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  listingFeature: {
    fontSize: 10,
    backgroundColor: '#e8f5e8',
    color: '#2d5a27',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  outOfStock: {
    fontSize: 11,
    color: '#d32f2f',
    marginTop: 2,
  },
  noListingsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginVertical: 10,
  },
  noListingsText: {
    fontSize: 14,
    color: '#5a7c50',
    fontWeight: '600',
  },
  noListingsSubtext: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginTop: 4,
  },
  keywordsContainer: {
    marginTop: 10,
  },
  keywordsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 8,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  keyword: {
    backgroundColor: '#e8f5e8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    color: '#2d5a27',
  },
  footer: {
    padding: 20,
  },
  visualizeButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  visualizeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Wishlist styles
  wishlistButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  wishlistButtonActive: {
    backgroundColor: '#4a7c59',
  },
  wishlistButtonInactive: {
    backgroundColor: '#ccc',
  },
  wishlistButtonText: {
    fontSize: 18,
  },
});