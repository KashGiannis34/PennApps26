const express = require('express');
const Wishlist = require('../models/Wishlist');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        name: 'My Wishlist',
        items: []
      });
      await wishlist.save();
    }

    res.json({
      success: true,
      data: {
        wishlist
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist',
      error: error.message
    });
  }
});

// Add item to wishlist
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const itemData = req.body;

    // Validate required fields
    if (!itemData.productId || !itemData.name || !itemData.price) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, name, and price are required'
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        name: 'My Wishlist',
        items: []
      });
    }

    // Check if item already exists
    const existingItemIndex = wishlist.items.findIndex(
      item => item.productId === itemData.productId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      wishlist.items[existingItemIndex] = {
        ...wishlist.items[existingItemIndex].toObject(),
        ...itemData,
        updatedAt: new Date()
      };
    } else {
      // Add new item
      wishlist.items.push(itemData);
    }

    await wishlist.save();

    res.status(201).json({
      success: true,
      message: existingItemIndex !== -1 ? 'Item updated in wishlist' : 'Item added to wishlist',
      data: {
        wishlist
      }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add item to wishlist',
      error: error.message
    });
  }
});

// Remove item from wishlist
router.delete('/items/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    const itemIndex = wishlist.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    res.json({
      success: true,
      message: 'Item removed from wishlist',
      data: {
        wishlist
      }
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist',
      error: error.message
    });
  }
});

// Update item in wishlist (e.g., add notes, change category)
router.put('/items/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    const item = wishlist.items.find(item => item.productId === productId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    // Update item with new data
    Object.assign(item, updateData);
    item.updatedAt = new Date();

    await wishlist.save();

    res.json({
      success: true,
      message: 'Item updated in wishlist',
      data: {
        wishlist
      }
    });

  } catch (error) {
    console.error('Update wishlist item error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update item in wishlist',
      error: error.message
    });
  }
});

// Update wishlist metadata (name, description, tags)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, tags, isPublic } = req.body;

    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        items: []
      });
    }

    // Update wishlist metadata
    if (name !== undefined) wishlist.name = name;
    if (description !== undefined) wishlist.description = description;
    if (tags !== undefined) wishlist.tags = tags;
    if (isPublic !== undefined) wishlist.isPublic = isPublic;

    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist updated successfully',
      data: {
        wishlist
      }
    });

  } catch (error) {
    console.error('Update wishlist error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist',
      error: error.message
    });
  }
});

// Get specific item from wishlist
router.get('/items/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    const item = wishlist.items.find(item => item.productId === productId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    res.json({
      success: true,
      data: {
        item
      }
    });

  } catch (error) {
    console.error('Get wishlist item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist item',
      error: error.message
    });
  }
});

// Clear entire wishlist
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: {
        wishlist
      }
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
});

module.exports = router;