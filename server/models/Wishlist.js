const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true // This could be from your product service or external API
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true // e.g., "Amazon", "eBay", etc.
  },
  url: {
    type: String,
    required: true
  },
  rating: {
    type: String,
    default: '0'
  },
  reviews: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  features: [{
    type: String
  }],
  shipping: {
    type: String,
    default: 'Shipping info not available'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  // Store original search data for reference
  searchKeywords: [{
    type: String
  }],
  category: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [wishlistItemSchema],
  name: {
    type: String,
    default: 'My Wishlist',
    trim: true,
    maxlength: [100, 'Wishlist name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
}, { collection: 'wishlists' });

// Create indexes for better query performance
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ 'items.productId': 1 });
wishlistSchema.index({ tags: 1 });

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = function(itemData) {
  // Check if item already exists
  const existingItem = this.items.find(item => item.productId === itemData.productId);

  if (existingItem) {
    // Update existing item
    Object.assign(existingItem, itemData);
  } else {
    // Add new item
    this.items.push(itemData);
  }

  return this.save();
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.productId !== productId);
  return this.save();
};

// Method to update item in wishlist
wishlistSchema.methods.updateItem = function(productId, updateData) {
  const item = this.items.find(item => item.productId === productId);
  if (item) {
    Object.assign(item, updateData);
    return this.save();
  }
  throw new Error('Item not found in wishlist');
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;