const express = require('express');
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/auth');
const { saveGreenovationImages } = require('../middleware/imageStorage');

const router = express.Router();

// Simplified Greenovation Schema with signed URLs
const greenovationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Room Transformation'
  },
  description: {
    type: String,
    default: 'AI-generated sustainable room makeover'
  },
  notes: {
    type: String,
    default: ''
  },
  originalImage: {
    type: String,
    required: true // Signed URL for original room photo
  },
  generatedImage: {
    type: String,
    required: true // Signed URL for AI-generated transformation
  },
  // Store S3 keys for URL regeneration if needed
  originalImageS3Key: {
    type: String,
    required: true
  },
  generatedImageS3Key: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Greenovation = mongoose.model('Greenovation', greenovationSchema);

// GET /api/greenovations - Get user's greenovations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const greenovations = await Greenovation.find({ userId })
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      success: true,
      data: {
        greenovations: greenovations
      }
    });
  } catch (error) {
    console.error('Get greenovations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch greenovations'
    });
  }
});

// POST /api/greenovations - Save new greenovation with signed URLs
router.post('/', authenticateToken, saveGreenovationImages, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      description,
      notes,
      originalImage,
      generatedImage,
      originalImageS3Key,
      generatedImageS3Key
    } = req.body;

    // At this point, originalImage and generatedImage are signed URLs
    // and originalImageS3Key/generatedImageS3Key contain the S3 keys

    const greenovation = new Greenovation({
      userId,
      name: name || `Room Transformation ${new Date().toLocaleDateString()}`,
      description: description || 'AI-generated sustainable room makeover',
      notes: notes || '',
      originalImage, // Signed URL
      generatedImage, // Signed URL
      originalImageS3Key, // S3 key for future URL generation
      generatedImageS3Key // S3 key for future URL generation
    });

    const savedGreenovation = await greenovation.save();

    res.status(201).json({
      success: true,
      message: 'Greenovation saved successfully',
      data: {
        greenovation: savedGreenovation
      }
    });
  } catch (error) {
    console.error('Save greenovation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save greenovation'
    });
  }
});

// GET /api/greenovations/:id - Get single greenovation
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const greenovationId = req.params.id;

    const greenovation = await Greenovation.findOne({
      _id: greenovationId,
      userId: userId
    });

    if (!greenovation) {
      return res.status(404).json({
        success: false,
        message: 'Greenovation not found'
      });
    }

    res.json({
      success: true,
      data: {
        greenovation: greenovation
      }
    });
  } catch (error) {
    console.error('Get greenovation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch greenovation'
    });
  }
});

// PATCH /api/greenovations/:id - Update greenovation
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const greenovationId = req.params.id;
    const updates = req.body;

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    const greenovation = await Greenovation.findOneAndUpdate(
      { _id: greenovationId, userId: userId },
      updates,
      { new: true }
    );

    if (!greenovation) {
      return res.status(404).json({
        success: false,
        message: 'Greenovation not found'
      });
    }

    res.json({
      success: true,
      message: 'Greenovation updated successfully',
      data: {
        greenovation: greenovation
      }
    });
  } catch (error) {
    console.error('Update greenovation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update greenovation'
    });
  }
});

// DELETE /api/greenovations/:id - Delete greenovation and cleanup S3 images
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const greenovationId = req.params.id;

    const greenovation = await Greenovation.findOneAndDelete({
      _id: greenovationId,
      userId: userId
    });

    if (!greenovation) {
      return res.status(404).json({
        success: false,
        message: 'Greenovation not found'
      });
    }

    // Optional: Clean up S3 images using S3 keys
    try {
      const { deleteImage } = require('../middleware/imageStorage');
      if (greenovation.originalImageS3Key) {
        // Extract filename from S3 key (sustainaView/filename.jpg -> filename.jpg)
        const originalFilename = greenovation.originalImageS3Key.split('/').pop();
        await deleteImage(originalFilename);
      }
      if (greenovation.generatedImageS3Key) {
        // Extract filename from S3 key (sustainaView/filename.jpg -> filename.jpg)
        const generatedFilename = greenovation.generatedImageS3Key.split('/').pop();
        await deleteImage(generatedFilename);
      }
      console.log('S3 images cleaned up successfully');
    } catch (cleanupError) {
      console.warn('S3 cleanup failed (non-critical):', cleanupError.message);
    }

    res.json({
      success: true,
      message: 'Greenovation deleted successfully'
    });
  } catch (error) {
    console.error('Delete greenovation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete greenovation'
    });
  }
});

module.exports = router;