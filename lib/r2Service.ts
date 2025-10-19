// Cloudflare R2 Service for file operations
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn('R2 configuration incomplete. File operations will fail.');
}

// Create HMAC-SHA256 signature for R2 authentication
async function createSignature(stringToSign: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(R2_SECRET_ACCESS_KEY);
  const messageData = encoder.encode(stringToSign);

  const signature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    stringToSign,
    { key: keyData }
  );

  return signature;
}

// Create authorization header for R2
async function createAuthHeader(method: string, path: string, date: string): Promise<string> {
  const stringToSign = `${method}\n\n\n${date}\n${path}`;
  const signature = await createSignature(stringToSign);
  return `AWS ${R2_ACCESS_KEY_ID}:${signature}`;
}

// Get current date in AWS format
function getDateString(): string {
  const now = new Date();
  return now.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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
      const fileKey = `uploads/${Date.now()}-${fileName}`;
      const dateString = getDateString();
      const path = `/${R2_BUCKET_NAME}/${fileKey}`;

      // Get file info and content
      const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create authorization header
      const authHeader = await createAuthHeader('PUT', path, dateString);

      // Upload to R2
      const response = await fetch(`${R2_ENDPOINT}${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Date': dateString,
          'Content-Type': this.getContentType(fileName),
          'x-amz-acl': 'public-read',
        },
        body: Uint8Array.from(atob(fileContent), c => c.charCodeAt(0)),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      console.log('Successfully uploaded to R2:', fileName);

      return {
        id: Date.now().toString(),
        name: fileName,
        type: this.getFileType(fileName),
        size: formatFileSize(fileInfo.size || 0),
        uploadedAt: new Date().toISOString().split('T')[0],
        url: `${R2_ENDPOINT}/${fileKey}`,
        key: fileKey,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  static async downloadFile(fileKey: string): Promise<string> {
    try {
      // For now, return the public URL since we set ACL to public-read
      // In production, you might want to generate signed URLs for private files
      return `${R2_ENDPOINT}/${fileKey}`;
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  static async deleteFile(fileKey: string): Promise<void> {
    try {
      const dateString = getDateString();
      const path = `/${R2_BUCKET_NAME}/${fileKey}`;

      const authHeader = await createAuthHeader('DELETE', path, dateString);

      const response = await fetch(`${R2_ENDPOINT}${path}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
          'Date': dateString,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      console.log('Successfully deleted from R2:', fileKey);
    } catch (error) {
      console.error('R2 delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  static async listFiles(): Promise<FileInfo[]> {
    try {
      const dateString = getDateString();
      const path = `/${R2_BUCKET_NAME}/?list-type=2&prefix=uploads/`;

      const authHeader = await createAuthHeader('GET', path, dateString);

      const response = await fetch(`${R2_ENDPOINT}${path}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Date': dateString,
        },
      });

      if (!response.ok) {
        throw new Error(`List failed: ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();

      // Parse XML response (simplified parsing)
      const files: FileInfo[] = [];
      const keyMatches = xmlText.match(/<Key>(.*?)<\/Key>/g) || [];
      const sizeMatches = xmlText.match(/<Size>(.*?)<\/Size>/g) || [];
      const dateMatches = xmlText.match(/<LastModified>(.*?)<\/LastModified>/g) || [];

      for (let i = 0; i < keyMatches.length; i++) {
        const key = keyMatches[i].replace(/<\/?Key>/g, '');
        const size = sizeMatches[i] ? parseInt(sizeMatches[i].replace(/<\/?Size>/g, '')) : 0;
        const lastModified = dateMatches[i] ? dateMatches[i].replace(/<\/?LastModified>/g, '') : '';

        files.push({
          id: key,
          name: key.split('/').pop() || key,
          type: this.getFileType(key),
          size: formatFileSize(size),
          uploadedAt: new Date(lastModified).toISOString().split('T')[0],
          url: `${R2_ENDPOINT}/${key}`,
          key: key,
        });
      }

      console.log(`Successfully listed ${files.length} files from R2`);
      return files;
    } catch (error) {
      console.error('R2 list error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
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
}

export default R2Service;
