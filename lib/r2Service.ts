// Cloudflare R2 Service for file operations
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME;
const R2_REGION = process.env.EXPO_PUBLIC_R2_REGION;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn('R2 configuration incomplete. File operations will be mocked.');
}

const s3Client = new S3Client({
  region: R2_REGION || 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
  // Cloudflare R2 specific configuration
  forcePathStyle: true,
});

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  url: string;
  key: string;
}

export class R2Service {
  static async uploadFile(fileUri: string, fileName: string): Promise<FileInfo> {
    try {
      // Read file as base64
      const fileContent = await fetch(fileUri);
      const blob = await fileContent.blob();

      // Convert to Uint8Array
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const fileKey = `uploads/${Date.now()}-${fileName}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
        Body: uint8Array,
        ContentType: this.getContentType(fileName),
        ACL: 'public-read', // Make file publicly accessible
      });

      await s3Client.send(uploadCommand);

      const publicUrl = `${R2_ENDPOINT}/${fileKey}`;

      return {
        id: Date.now().toString(),
        name: fileName,
        type: this.getFileType(fileName),
        size: this.formatFileSize(blob.size),
        uploadedAt: new Date().toISOString().split('T')[0],
        url: publicUrl,
        key: fileKey,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  static async downloadFile(fileKey: string): Promise<string> {
    try {
      const downloadCommand = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
      });

      const response = await s3Client.send(downloadCommand);

      if (response.Body) {
        // Convert stream to blob URL or handle download
        const blob = new Blob([await response.Body.transformToByteArray()]);
        return URL.createObjectURL(blob);
      }

      throw new Error('File not found');
    } catch (error) {
      console.error('R2 download error:', error);
      throw new Error('Failed to download file');
    }
  }

  static async deleteFile(fileKey: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
      });

      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error('R2 delete error:', error);
      throw new Error('Failed to delete file');
    }
  }

  static async listFiles(): Promise<FileInfo[]> {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: 'uploads/',
      });

      const response = await s3Client.send(listCommand);

      if (!response.Contents) return [];

      return response.Contents.map((object) => ({
        id: object.Key || '',
        name: object.Key?.split('/').pop() || '',
        type: this.getFileType(object.Key || ''),
        size: this.formatFileSize(object.Size || 0),
        uploadedAt: object.LastModified?.toISOString().split('T')[0] || '',
        url: `${R2_ENDPOINT}/${object.Key}`,
        key: object.Key || '',
      }));
    } catch (error) {
      console.error('R2 list error:', error);
      throw new Error('Failed to list files');
    }
  }

  private static getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'zip': 'application/zip',
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  private static getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const fileTypes: { [key: string]: string } = {
      'pdf': 'pdf',
      'doc': 'document',
      'docx': 'document',
      'xls': 'spreadsheet',
      'xlsx': 'spreadsheet',
      'ppt': 'presentation',
      'pptx': 'presentation',
      'txt': 'text',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'mp4': 'video',
      'mp3': 'audio',
      'zip': 'archive',
    };

    return fileTypes[ext || ''] || 'file';
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default R2Service;
