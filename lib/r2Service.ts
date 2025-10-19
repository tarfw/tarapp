// Cloudflare R2 Service for file operations
import { Buffer } from '@craftzdog/react-native-buffer';
import CryptoJS from 'crypto-js';

// Polyfill global Buffer
global.Buffer = Buffer;

const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME;

const EMPTY_PAYLOAD_HASH = CryptoJS.SHA256('').toString(CryptoJS.enc.Hex);

function getAmzDate(): string {
  return new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
}

interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

function getConfig(): R2Config {
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw new Error('Cloudflare R2 environment variables are not fully configured');
  }

  return {
    endpoint: R2_ENDPOINT,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucketName: R2_BUCKET_NAME,
  };
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function getCanonicalUri(pathname: string): string {
  return pathname
    .split('/')
    .map((segment) => encodeRfc3986(segment))
    .join('/');
}

function getCanonicalQuery(searchParams: URLSearchParams): string {
  const items = Array.from(searchParams.entries()).map(([key, value]) => ({
    key: encodeRfc3986(key),
    value: encodeRfc3986(value),
  }));

  items.sort((a, b) => {
    if (a.key === b.key) {
      return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
    }
    return a.key < b.key ? -1 : 1;
  });

  return items.map(({ key, value }) => `${key}=${value}`).join('&');
}

function createSigningKey(secretKey: string, dateStamp: string, region: string, service: string): CryptoJS.lib.WordArray {
  const kDate = CryptoJS.HmacSHA256(dateStamp, `AWS4${secretKey}`);
  const kRegion = CryptoJS.HmacSHA256(region, kDate);
  const kService = CryptoJS.HmacSHA256(service, kRegion);
  return CryptoJS.HmacSHA256('aws4_request', kService);
}

function wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const { words, sigBytes } = wordArray;
  const result = new Uint8Array(sigBytes);

  for (let i = 0; i < sigBytes; i += 1) {
    const word = words[i >>> 2];
    result[i] = (word >>> (24 - (i % 4) * 8)) & 0xff;
  }

  return result;
}

function signRequest(
  method: string,
  url: URL,
  config: R2Config,
  extraHeaders: Record<string, string> = {},
  payloadHash: string = EMPTY_PAYLOAD_HASH,
): Record<string, string> {
  const host = url.host;
  const amzDate = getAmzDate();
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeadersMap: Record<string, string> = {
    host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  };

  Object.entries(extraHeaders).forEach(([key, value]) => {
    canonicalHeadersMap[key.toLowerCase()] = value.trim();
  });

  const sortedHeaderKeys = Object.keys(canonicalHeadersMap).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((key) => `${key}:${canonicalHeadersMap[key].replace(/\s+/g, ' ')}`)
    .join('\n');

  const signedHeaders = sortedHeaderKeys.join(';');
  const canonicalUri = getCanonicalUri(url.pathname);
  const canonicalQuery = getCanonicalQuery(url.searchParams);

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
  const credentialScope = `${dateStamp}/apac/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hashedCanonicalRequest,
  ].join('\n');

  const signingKey = createSigningKey(config.secretAccessKey, dateStamp, 'apac', 's3');
  const signature = CryptoJS.HmacSHA256(stringToSign, signingKey).toString(CryptoJS.enc.Hex);

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const requestHeaders: Record<string, string> = {
    ...extraHeaders,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    Authorization: authorizationHeader,
  };

  return requestHeaders;
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

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export class R2Service {
  static async uploadFile(file: { uri: string; name: string; size?: number; type?: string }, prefix: string = 'media'): Promise<FileInfo> {
    console.log('🚀 R2 Upload Started');
    console.log('📁 File details:', file);

    try {
      const config = getConfig();

      // Generate unique key exactly like tar2
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const safeName = file.name || `file_${timestamp}`;
      const extension = safeName.split('.').pop() || '';
      const fileKey = `user/${prefix}/${timestamp}-${randomId}.${extension}`;
      const path = `/${config.bucketName}/${fileKey}`;

      console.log('🗝️ Generated File Key:', fileKey);
      console.log('🛣️ R2 Path:', path);

      // Read file using fetch (like in tar2)
      console.log('📖 Reading file content using fetch...');
      const response = await fetch(file.uri);
      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('📏 File Size:', blob.size, 'bytes');

      console.log('📦 File content loaded, size:', blob.size);

      console.log('🔐 Preparing AWS Signature V4 headers...');

      const contentType = file.type || this.getContentType(file.name);
      console.log('📋 Content-Type:', contentType);

      const uploadUrl = new URL(path, config.endpoint);
      console.log('🌐 Upload URL:', uploadUrl.toString());

      const headers = signRequest('PUT', uploadUrl, config, {
        'Content-Type': contentType,
      }, 'UNSIGNED-PAYLOAD');

      console.log('⬆️ Starting upload to Cloudflare R2...');
      const uploadResponse = await fetch(uploadUrl.toString(), {
        method: 'PUT',
        headers,
        body: blob,
      });

      console.log('📡 Response Status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Upload failed with response:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const publicUrl = `https://pub-${config.bucketName}.r2.dev/${fileKey}`;
      console.log('✅ Successfully uploaded to R2!');
      console.log('🔗 Public URL:', publicUrl);
      console.log('🗝️ File Key:', fileKey);

      const result = {
        id: Date.now().toString(),
        name: file.name,
        type: this.getFileType(file.name),
        size: formatFileSize(blob.size),
        uploadedAt: new Date().toISOString().split('T')[0],
        url: publicUrl,
        key: fileKey,
      };

      console.log('📋 File Info Result:', result);
      return result;

    } catch (error) {
      console.error('💥 R2 upload error:', error);
      throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
  }

  static async downloadFile(fileKey: string): Promise<string> {
    try {
      // For now, return the public URL since we set ACL to public-read
      // In production, you might want to generate signed URLs for private files
      const config = getConfig();
      return `${config.endpoint}/${fileKey}`;
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  static async deleteFile(fileKey: string): Promise<void> {
    try {
      console.log('🗑️ Starting delete operation for:', fileKey);

      const config = getConfig();

      const path = `/${config.bucketName}/${fileKey}`;

      console.log('🛣️ Delete path:', path);

      const deleteUrl = new URL(path, config.endpoint);
      console.log('🌐 Delete URL:', deleteUrl.toString());

      const headers = signRequest('DELETE', deleteUrl, config);

      const response = await fetch(deleteUrl.toString(), {
        method: 'DELETE',
        headers,
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
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }

  // Extract key from URL
  static extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1); // Remove leading slash
      return key;
    } catch (error) {
      return null;
    }
  }

  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
    console.log('🔐 getSignedUrl called for key:', key, 'expiresIn:', expiresIn);
    try {
      const config = getConfig();
      console.log('⚙️ R2 Config - endpoint:', config.endpoint, 'bucket:', config.bucketName, 'accessKey:', config.accessKeyId.substring(0, 8) + '...');

      const amzDate = getAmzDate();
      const dateStamp = amzDate.slice(0, 8);
      const expires = expiresIn.toString();

      const credential = `${config.accessKeyId}/${dateStamp}/apac/s3/aws4_request`;

      const canonicalUri = `/${config.bucketName}/${key}`;

      // Build query params and sort them
      const queryParams = [
        { key: 'X-Amz-Algorithm', value: 'AWS4-HMAC-SHA256' },
        { key: 'X-Amz-Credential', value: credential },
        { key: 'X-Amz-Date', value: amzDate },
        { key: 'X-Amz-Expires', value: expires },
        { key: 'X-Amz-SignedHeaders', value: 'host' },
      ];

      queryParams.sort((a, b) => a.key.localeCompare(b.key));

      const canonicalQuery = queryParams.map(p => `${p.key}=${encodeURIComponent(p.value)}`).join('&');
      console.log('📋 Canonical query:', canonicalQuery);

      const canonicalHeaders = `host:${new URL(config.endpoint).hostname}`;
      const signedHeaders = 'host';
      console.log('📋 Canonical headers:', canonicalHeaders);

      const canonicalRequest = [
        'GET',
        canonicalUri,
        canonicalQuery,
        canonicalHeaders,
        '',
        signedHeaders,
        EMPTY_PAYLOAD_HASH,
      ].join('\n');
      console.log('📄 Canonical request:', canonicalRequest.replace(/\n/g, '\\n'));

      const hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
      console.log('🔒 Hashed canonical request:', hashedCanonicalRequest);
      const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        `${dateStamp}/apac/s3/aws4_request`,
        hashedCanonicalRequest,
      ].join('\n');
      console.log('📝 String to sign:', stringToSign.replace(/\n/g, '\\n'));

      // Calculate signature (using apac region for R2)
      const kDate = CryptoJS.HmacSHA256(dateStamp, `AWS4${config.secretAccessKey}`);
      const kRegion = CryptoJS.HmacSHA256('apac', kDate);
      const kService = CryptoJS.HmacSHA256('s3', kRegion);
      const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
      const signature = CryptoJS.HmacSHA256(stringToSign, kSigning).toString(CryptoJS.enc.Hex);
      console.log('✍️ Signature:', signature);

      const signedQuery = `${canonicalQuery}&X-Amz-Signature=${signature}`;
      const signedUrl = `${config.endpoint}/${config.bucketName}/${key}?${signedQuery}`;
      console.log('🔗 Final signed URL:', signedUrl);

      return signedUrl;
    } catch (error) {
      console.error('❌ Failed to generate signed URL:', error);
      return null;
    }
  }

  static async listFiles(): Promise<FileInfo[]> {
    try {
      const config = getConfig();

      console.log('📂 Attempting to list files from R2...');

      const listUrl = new URL(`/${config.bucketName}/`, config.endpoint);
      listUrl.searchParams.set('list-type', '2');
      listUrl.searchParams.set('prefix', 'user/');

      console.log('🌐 List URL:', listUrl.toString());

      const headers = signRequest('GET', listUrl, config);

      const response = await fetch(listUrl.toString(), {
        method: 'GET',
        headers,
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

      const files: FileInfo[] = [];
      const keyMatches = xmlText.match(/<Key>(.*?)<\/Key>/g) || [];
      const sizeMatches = xmlText.match(/<Size>(.*?)<\/Size>/g) || [];
      const dateMatches = xmlText.match(/<LastModified>(.*?)<\/LastModified>/g) || [];

      console.log('🔍 Found keys:', keyMatches.length);

      for (let i = 0; i < keyMatches.length; i += 1) {
        const key = keyMatches[i].replace(/<\/?Key>/g, '');
        const size = sizeMatches[i] ? parseInt(sizeMatches[i].replace(/<\/?Size>/g, ''), 10) : 0;
        const lastModifiedRaw = dateMatches[i]
          ? dateMatches[i].replace(/<\/?LastModified>/g, '')
          : '';

        let uploadedAt = '';
        if (lastModifiedRaw) {
          const parsedDate = new Date(lastModifiedRaw);
          if (!Number.isNaN(parsedDate.getTime())) {
            uploadedAt = parsedDate.toISOString().split('T')[0];
          }
        }

        files.push({
          id: key,
          name: key.split('/').pop() || key,
          type: this.getFileType(key),
          size: formatFileSize(size),
          uploadedAt,
          url: `https://pub-${config.bucketName}.r2.dev/${key}`,
          key,
        });
      }

      console.log(`✅ Successfully listed ${files.length} files from R2`);
      return files;
    } catch (error) {
      console.error('💥 R2 list error:', error);
      throw new Error(`Failed to list files: ${(error as Error).message}`);
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
