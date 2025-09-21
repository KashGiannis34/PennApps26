const { S3Client } = require('@aws-sdk/client-s3');

let client;

function getS3Client() {
	if (!client) {
		// Validate required environment variables
		const requiredEnvVars = ['AWS_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'];
		const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

		if (missingVars.length > 0) {
			throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
		}

		// Validate credential format
		const accessKeyId = process.env.S3_ACCESS_KEY_ID.trim();
		const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY.trim();
		const region = process.env.AWS_REGION.trim();

		if (accessKeyId.length < 16) {
			throw new Error('S3_ACCESS_KEY_ID appears to be invalid (too short)');
		}

		if (secretAccessKey.length < 20) {
			throw new Error('S3_SECRET_ACCESS_KEY appears to be invalid (too short)');
		}

		console.log('Initializing S3 Client with:');
		console.log('- Region:', region);
		console.log('- Access Key ID:', accessKeyId.substring(0, 8) + '***');
		console.log('- Bucket:', process.env.S3_BUCKET_NAME);

		try {
			client = new S3Client({
				region: region,
				credentials: {
					accessKeyId: accessKeyId,
					secretAccessKey: secretAccessKey
				},
				// Add explicit configuration options
				maxAttempts: 3,
				requestTimeout: 30000,
				forcePathStyle: false
			});

			console.log('✅ S3 Client initialized successfully');
		} catch (error) {
			console.error('❌ Failed to initialize S3 Client:', error.message);
			throw error;
		}
	}
	return client;
}

module.exports = { getS3Client };