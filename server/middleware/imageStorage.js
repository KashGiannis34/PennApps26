const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getS3Client } = require('./s3client');
const { randomUUID } = require('crypto');
const sharp = require('sharp');

class ImageStorageService {
    constructor() {
        try {
            this.s3Client = getS3Client();
            this.bucketName = process.env.S3_BUCKET_NAME;
            console.log('📸 ImageStorageService initialized');
        } catch (error) {
            console.error('❌ Failed to initialize ImageStorageService:', error.message);
            throw error;
        }
    }

    // Generate unique filename with UUID
    generateFilename(extension = 'jpg') {
        const uuid = randomUUID();
        return `${uuid}.${extension}`;
    }

    // Convert base64 to buffer and compress
    async processImageData(base64Data) {
        try {
            // Remove data URL prefix if present (data:image/jpeg;base64,)
            const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
            const buffer = Buffer.from(base64String, 'base64');

            // Compress image using sharp
            const compressedBuffer = await sharp(buffer)
                .jpeg({ quality: 85, progressive: true })
                .resize(1024, 1024, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toBuffer();

            return compressedBuffer;
        } catch (error) {
            console.error('Error processing image data:', error);
            throw new Error('Failed to process image data');
        }
    }

    // Test S3 credentials and connectivity
    async testS3Connection() {
        try {
            const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                MaxKeys: 1
            });

            await this.s3Client.send(command);
            console.log('✅ S3 connection test successful');
            return { success: true };
        } catch (error) {
            console.error('❌ S3 connection test failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Generate signed URL for S3 object
    async generateSignedUrl(s3Key, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key
            });

            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
            return signedUrl;
        } catch (error) {
            console.error('❌ Error generating signed URL:', error);
            throw new Error(`Failed to generate signed URL: ${error.message}`);
        }
    }

    // Save image to S3 and return signed URL
    async saveImageToS3(imageData, filename = null) {
        try {
            const generatedFilename = filename || this.generateFilename();
            const compressedBuffer = await this.processImageData(imageData);

            console.log(`📤 Uploading image to S3: ${generatedFilename}`);

            const s3Key = `sustainaView/${generatedFilename}`;
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key,
                Body: compressedBuffer,
                ContentType: 'image/jpeg'
            });

            const result = await this.s3Client.send(command);
            console.log('✅ Image uploaded successfully:', result.ETag);

            // Generate signed URL that expires in 24 hours
            const signedUrl = await this.generateSignedUrl(s3Key, 86400); // 24 hours

            return {
                success: true,
                filename: generatedFilename,
                s3Key: s3Key,
                signedUrl: signedUrl
            };
        } catch (error) {
            console.error('❌ Error saving image to S3:', error);
            console.error('Error details:', {
                code: error.Code,
                message: error.message,
                statusCode: error.$metadata?.httpStatusCode
            });
            throw new Error(`Failed to save image to S3: ${error.message}`);
        }
    }

    // Get image from S3
    async getImageFromS3(filename) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: `sustainaView/${filename}`
            });

            const response = await this.s3Client.send(command);
            return response.Body;
        } catch (error) {
            console.error('Error retrieving image from S3:', error);
            throw new Error('Failed to retrieve image from S3');
        }
    }

    // Save both original and generated images for a greenovation
    async saveGreenovationImages(originalImageData, generatedImageData) {
        try {
            const [originalResult, generatedResult] = await Promise.all([
                this.saveImageToS3(originalImageData, this.generateFilename('jpg')),
                this.saveImageToS3(generatedImageData, this.generateFilename('jpg'))
            ]);

            return {
                success: true,
                originalImage: {
                    filename: originalResult.filename,
                    s3Key: originalResult.s3Key,
                    signedUrl: originalResult.signedUrl
                },
                generatedImage: {
                    filename: generatedResult.filename,
                    s3Key: generatedResult.s3Key,
                    signedUrl: generatedResult.signedUrl
                }
            };
        } catch (error) {
            console.error('Error saving greenovation images:', error);
            throw new Error('Failed to save greenovation images');
        }
    }
}

// Express middleware for image operations
let imageStorageService = null;

// Helper function to get or create the service instance
const getImageStorageService = () => {
    if (!imageStorageService) {
        imageStorageService = new ImageStorageService();
    }
    return imageStorageService;
};

// Middleware to save images during greenovation creation
const saveGreenovationImages = async (req, res, next) => {
    try {
        const { originalImage, generatedImage } = req.body;

        if (!originalImage || !generatedImage) {
            return res.status(400).json({
                success: false,
                message: 'Both original and generated images are required'
            });
        }

        console.log('Saving greenovation images to S3...');
        const service = getImageStorageService();
        const imageResults = await service.saveGreenovationImages(originalImage, generatedImage);

        // Replace base64 data with signed URLs in request body
        req.body.originalImage = imageResults.originalImage.signedUrl;
        req.body.generatedImage = imageResults.generatedImage.signedUrl;

        // Store S3 keys for potential future operations (regenerating URLs, etc.)
        req.body.originalImageS3Key = imageResults.originalImage.s3Key;
        req.body.generatedImageS3Key = imageResults.generatedImage.s3Key;

        console.log('Images saved successfully to S3');
        next();
    } catch (error) {
        console.error('Image storage middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save images',
            error: error.message
        });
    }
};

// Middleware to retrieve and serve images
const getImage = async (req, res) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(400).json({
                success: false,
                message: 'Filename is required'
            });
        }

        console.log(`Retrieving image: ${filename}`);
        const service = getImageStorageService();
        const imageStream = await service.getImageFromS3(filename);

        // Set proper headers
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Pipe the image stream to response
        if (imageStream.pipe) {
            imageStream.pipe(res);
        } else {
            // For compatibility with different AWS SDK versions
            const chunks = [];
            for await (const chunk of imageStream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            res.send(buffer);
        }
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(404).json({
            success: false,
            message: 'Image not found',
            error: error.message
        });
    }
};

// Utility function to delete images from S3 (for cleanup)
const deleteImage = async (filename) => {
    try {
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `sustainaView/${filename}`
        });

        const service = getImageStorageService();
        await service.s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error('Error deleting image from S3:', error);
        throw new Error('Failed to delete image from S3');
    }
};

module.exports = {
    ImageStorageService,
    getImageStorageService,
    saveGreenovationImages,
    getImage,
    deleteImage
};