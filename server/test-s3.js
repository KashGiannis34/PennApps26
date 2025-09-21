// Test script for S3 image storage
// Run with: node test-s3.js

const { ImageStorageService } = require('./middleware/imageStorage');
require('dotenv').config();

async function testS3Integration() {
    console.log('🧪 Testing S3 Image Storage Integration...\n');

    try {
        console.log('0. Initializing ImageStorageService...');
        const imageService = new ImageStorageService();
        console.log('✅ ImageStorageService initialized\n');

        console.log('0.5. Skipping S3 connection test (not needed for signed URLs)\n');
    } catch (initError) {
        console.error('❌ Initialization failed:', initError.message);
        return;
    }

    const imageService = new ImageStorageService();

    // Test data - a small base64 encoded test image (1x1 pixel red dot)
    const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

    try {
        console.log('1. Testing image processing...');
        const processedBuffer = await imageService.processImageData(testBase64);
        console.log('✅ Image processed successfully');
        console.log(`   Buffer size: ${processedBuffer.length} bytes\n`);

        console.log('2. Testing S3 upload...');
        const uploadResult = await imageService.saveImageToS3(testBase64);
        console.log('✅ Image uploaded to S3 successfully');
        console.log('   Result:', uploadResult);
        console.log('   Signed URL:', uploadResult.signedUrl, '\n');

        console.log('3. Testing S3 download...');
        const downloadResult = await imageService.getImageFromS3(uploadResult.filename);
        console.log('✅ Image downloaded from S3 successfully');
        console.log('   Stream type:', typeof downloadResult, '\n');

        console.log('4. Testing batch upload (greenovation)...');
        const batchResult = await imageService.saveGreenovationImages(testBase64, testBase64);
        console.log('✅ Batch upload successful');
        console.log('   Original signed URL:', batchResult.originalImage.signedUrl);
        console.log('   Generated signed URL:', batchResult.generatedImage.signedUrl, '\n');

        console.log('🎉 All S3 integration tests passed!');
        console.log('\nEnvironment Variables Check:');
        console.log('- AWS_REGION:', process.env.AWS_REGION ? '✅' : '❌');
        console.log('- S3_ACCESS_KEY_ID:', process.env.S3_ACCESS_KEY_ID ? '✅' : '❌');
        console.log('- S3_SECRET_ACCESS_KEY:', process.env.S3_SECRET_ACCESS_KEY ? '✅' : '❌');
        console.log('- S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME ? '✅' : '❌');

    } catch (error) {
        console.error('❌ S3 Integration Test Failed:');
        console.error('Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check your .env file has all S3 credentials');
        console.error('2. Verify AWS credentials have S3 access');
        console.error('3. Ensure S3 bucket exists and is accessible');
        console.error('4. Check AWS region is correct');
        console.error('5. Install required dependencies: npm install sharp @aws-sdk/client-s3');
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testS3Integration();
}

module.exports = { testS3Integration };