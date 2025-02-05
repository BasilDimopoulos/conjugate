import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';

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
  // Validate file type (PDF or Markdown)
  const allowedExtensions = ['.pdf', '.md'];
  const fileExtension = path.extname(fileName).toLowerCase();
  const mimeType =
    fileExtension === '.pdf'
      ? 'application/pdf'
      : fileExtension === '.md'
      ? 'text/markdown'
      : null;

  if (!allowedExtensions.includes(fileExtension) || !mimeType) {
    throw new Error('Only PDF and Markdown files are allowed.');
  }

  const bucketName = process.env.S3_BUCKET;
  const key = `uploads/${Date.now()}_${fileName}`; // Unique key for S3 object

  const fileStream = Buffer.isBuffer(filePathOrBuffer)
    ? filePathOrBuffer // Use the Buffer directly
    : fs.createReadStream(filePathOrBuffer); // Create a stream if given a file path

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
    ContentType: mimeType, // Set content type dynamically
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${bucketName}.s3.amazonaws.com/${key}`; // Return the public URL of the file
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3.');
  }
};

export default uploadFileToS3;
