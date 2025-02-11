import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import mime from 'mime-types';

// AWS S3 configuration
const s3Client = new S3Client({
  region: process.env.S3_REGION, // e.g., 'us-east-1'
});
/**
 * Upload a file to Amazon S3
 * @param filePathOrBuffer - The file path or Buffer to upload
 * @param fileName - The name of the file (used for validation and S3 key)
 * @returns Promise<string> - The URL of the uploaded file
 */
export const uploadFileToS3 = async (
  filePathOrBuffer: string | Buffer,
  fileName: string
): Promise<string> => {
  console.log('Uploading to S3...');

  // Dynamically determine MIME type
  const mimeType = mime.lookup(fileName) || 'application/octet-stream';

  const bucketName = process.env.S3_BUCKET;
  if (!bucketName)
    throw new Error('S3_BUCKET environment variable is missing.');

  const key = `uploads/${Date.now()}_${fileName}`; // Unique key for S3 object

  const fileStream = Buffer.isBuffer(filePathOrBuffer)
    ? filePathOrBuffer // Use Buffer directly
    : fs.createReadStream(filePathOrBuffer); // Create a stream if given a file path

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
    ContentType: mimeType, // Use dynamically determined MIME type
  };

  try {
    console.log('Sending file to S3...');
    await s3Client.send(new PutObjectCommand(params));
    console.log('File successfully uploaded:', key);
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
    console.log('Returning file URL:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3.');
  }
};

export default uploadFileToS3;
