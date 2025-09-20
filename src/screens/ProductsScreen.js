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

export default function ProductsScreen({ route, navigation }) {
  const { products, analysis } = route.params;
  const [productListings, setProductListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState(null);

  useEffect(() => {
    fetchProductListings();
  }, []);

  const fetchProductListings = async () => {
    setLoading(true);
    const listings = {};
    
    for (const product of products) {
      try {
        const results = await ProductService.searchProducts(
          product.searchKeywords, 
          product.name
        );
        listings[product.name] = results;
      } catch (error) {
        console.error(`Error fetching listings for ${product.name}:`, error);
        listings[product.name] = [];
      }
    }
    
    setProductListings(listings);
    setLoading(false);
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

  const toggleProductExpansion = (productName) => {
    setExpandedProduct(expandedProduct === productName ? null : productName);
  };

  const renderProduct = (product, index) => {
    const listings = productListings[product.name] || [];
    const isExpanded = expandedProduct === product.name;

    return (
      <View key={index} style={styles.productCard}>
        <TouchableOpacity 
          style={styles.productHeader}
          onPress={() => toggleProductExpansion(product.name)}
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

            {loading ? (
              <View style={styles.loadingListings}>
                <ActivityIndicator size="small" color="#4a7c59" />
                <Text style={styles.loadingText}>Finding products...</Text>
              </View>
            ) : (
              <View style={styles.listingsContainer}>
                <Text style={styles.listingsTitle}>🛒 Available Products:</Text>
                {listings.map((listing, listingIndex) => (
                  <TouchableOpacity
                    key={listingIndex}
                    style={styles.listingCard}
                    onPress={() => openProductUrl(listing.url)}
                  >
                    <Image source={{ uri: listing.image }} style={styles.listingImage} />
                    <View style={styles.listingInfo}>
                      <Text style={styles.listingName}>{listing.name}</Text>
                      <Text style={styles.listingPrice}>{listing.price}</Text>
                      <Text style={styles.listingSource}>📍 {listing.source}</Text>
                      <Text style={styles.listingRating}>
                        ⭐ {listing.rating} ({listing.reviews} reviews)
                      </Text>
                      <Text style={styles.listingShipping}>{listing.shipping}</Text>
                      {!listing.inStock && (
                        <Text style={styles.outOfStock}>⚠️ Limited Stock</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
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
      </View>

      {products.map((product, index) => renderProduct(product, index))}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.visualizeButton}
          onPress={() => navigation.navigate('Visualization', { analysis, products })}
        >
          <Text style={styles.visualizeButtonText}>🎨 Visualize Your Green Room</Text>
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
  loadingListings: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#5a7c50',
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
  listingCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  },
  outOfStock: {
    fontSize: 11,
    color: '#d32f2f',
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
});