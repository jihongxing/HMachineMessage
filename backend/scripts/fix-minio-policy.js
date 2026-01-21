const { Client } = require('minio');

const client = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
});

const bucket = 'machinery-images';

async function fixPolicy() {
  try {
    const exists = await client.bucketExists(bucket);
    if (!exists) {
      console.log(`Bucket ${bucket} does not exist, creating...`);
      await client.makeBucket(bucket, 'us-east-1');
    }

    // 设置公开读权限
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };

    await client.setBucketPolicy(bucket, JSON.stringify(policy));
    console.log(`Bucket ${bucket} policy updated successfully`);
    console.log('Policy:', JSON.stringify(policy, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

fixPolicy();
