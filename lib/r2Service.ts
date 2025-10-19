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
  // TEMPORARY: Return a mock signature to avoid crypto errors during testing
  // This allows the app to run and show the upload flow without authentication
  // TODO: Implement proper HMAC-SHA256 signing for production use
  console.log('🔐 Using mock signature for testing (not secure for production)');

  // Return a consistent mock signature for testing
  return 'mock-signature-for-testing-purposes-only';
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
    console.log('🚀 R2 Upload Started');
    console.log('📁 File URI:', fileUri);
    console.log('📄 File Name:', fileName);

    try {
      const fileKey = `uploads/${Date.now()}-${fileName}`;
      const dateString = getDateString();
      const path = `/${R2_BUCKET_NAME}/${fileKey}`;

      console.log('🗝️ Generated File Key:', fileKey);
      console.log('📅 Date String:', dateString);
      console.log('🛣️ R2 Path:', path);

      // Get file info and content
      console.log('📊 Getting file info...');
      const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      console.log('📏 File Size:', fileInfo.size, 'bytes');
      console.log('📖 Reading file content...');

      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('📦 File content loaded, length:', fileContent.length);

      // Create authorization header
      console.log('🔐 Creating authorization header...');
      const authHeader = await createAuthHeader('PUT', path, dateString);
      console.log('🔑 Auth Header Created');

      const contentType = this.getContentType(fileName);
      console.log('📋 Content-Type:', contentType);

      const uploadUrl = `${R2_ENDPOINT}${path}`;
      console.log('🌐 Upload URL:', uploadUrl);

      // Upload to R2
      console.log('⬆️ Starting upload to Cloudflare R2...');
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Date': dateString,
          'Content-Type': contentType,
          'x-amz-acl': 'public-read',
        },
        body: Uint8Array.from(atob(fileContent), c => c.charCodeAt(0)),
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response Status Text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed with response:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const publicUrl = `${R2_ENDPOINT}/${fileKey}`;
      console.log('✅ Successfully uploaded to R2!');
      console.log('🔗 Public URL:', publicUrl);
      console.log('🗝️ File Key:', fileKey);

      const result = {
        id: Date.now().toString(),
        name: fileName,
        type: this.getFileType(fileName),
        size: formatFileSize(fileInfo.size || 0),
        uploadedAt: new Date().toISOString().split('T')[0],
        url: publicUrl,
        key: fileKey,
      };

      console.log('📋 File Info Result:', result);
      return result;

    } catch (error) {
      console.error('💥 R2 upload error:', error);
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
      console.log('🗑️ Starting delete operation for:', fileKey);

      const dateString = getDateString();
      const path = `/${R2_BUCKET_NAME}/${fileKey}`;

      console.log('📅 Date string:', dateString);
      console.log('🛣️ Delete path:', path);

      const authHeader = await createAuthHeader('DELETE', path, dateString);
      console.log('🔑 Auth header created');

      const deleteUrl = `${R2_ENDPOINT}${path}`;
      console.log('🌐 Delete URL:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
          'Date': dateString,
        },
      });

      console.log('📡 Delete response status:', response.status);
      console.log('📡 Delete response status text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete failed with response:', errorText);
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Successfully deleted from R2:', fileKey);
    } catch (error) {
      console.error('💥 R2 delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  static async listFiles(): Promise<FileInfo[]> {
  try {
  console.log('📂 Attempting to list files from R2...');

      const dateString = getDateString();
  const path = `/${R2_BUCKET_NAME}/?list-type=2&prefix=uploads/`;

  console.log('📅 Date string:', dateString);
  console.log('🛣️ List path:', path);

  const authHeader = await createAuthHeader('GET', path, dateString);
  console.log('🔑 Auth header created');

  const listUrl = `${R2_ENDPOINT}${path}`;
      console.log('🌐 List URL:', listUrl);

  const response = await fetch(listUrl, {
    method: 'GET',
        headers: {
      'Authorization': authHeader,
          'Date': dateString,
    },
  });

  console.log('📡 List response status:', response.status);
  console.log('📡 List response status text:', response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ List request failed:', errorText);
    throw new Error(`List failed: ${response.status} ${response.statusText}`);
  }

  const xmlText = await response.text();
  console.log('📄 Raw XML response length:', xmlText.length);

  // Parse XML response (simplified parsing)
  const files: FileInfo[] = [];
  const keyMatches = xmlText.match(/<Key>(.*?)<\/Key>/g) || [];
  const sizeMatches = xmlText.match(/<Size>(.*?)<\/Size>/g) || [];
  const dateMatches = xmlText.match(/<LastModified>(.*?)<\/LastModified>/g) || [];

  console.log('🔍 Found keys:', keyMatches.length);

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

      console.log(`✅ Successfully listed ${files.length} files from R2`);
      return files;
    } catch (error) {
      console.error('💥 R2 list error:', error);
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
