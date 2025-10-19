import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import R2Service, { FileInfo } from '../lib/r2Service';

// File management with Cloudflare R2 integration

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return '📄';
    case 'image':
      return '🖼️';
    case 'document':
      return '📝';
    case 'presentation':
      return '📊';
    case 'video':
      return '🎥';
    case 'audio':
      return '🎵';
    default:
      return '📄';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getMimeType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
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

  return mimeTypes[ext || ''] || 'application/octet-stream';
};

export default function FilesAgent() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    console.log('📂 Loading files from R2...');
    try {
      setLoading(true);
      console.log('🔄 Set loading state to true');

      console.log('📡 Calling R2Service.listFiles()...');
      const fileList = await R2Service.listFiles();

      console.log('📋 Received file list:', fileList.length, 'files');
      console.log('📄 File list details:', fileList);

      setFiles(fileList);
      console.log('✅ Files state updated');
    } catch (error) {
      console.error('💥 Failed to load files from R2:', error);
      Alert.alert('Connection Error', 'Unable to load files from Cloudflare R2. Please check your internet connection and try again.');
      setFiles([]); // Empty array on error
    } finally {
      console.log('🔄 Setting loading state to false');
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uploadFile = async () => {
    console.log('📱 Upload button pressed - starting file picker');

    try {
      console.log('📂 Opening document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      console.log('📋 Document picker result:', result);

      if (result.type === 'success') {
        console.log('✅ File selected successfully');
        console.log('📄 Selected file:', result.name);
        console.log('📏 File size:', result.size);
        console.log('🗂️ File MIME type:', result.mimeType);
        console.log('📍 File URI:', result.uri);

        setUploading(true);
        console.log('⏳ Setting upload state to true');

        console.log('🚀 Calling R2Service.uploadFile...');
        // Upload to Cloudflare R2
        const uploadedFile = await R2Service.uploadFile(result.uri, result.name);

        console.log('📥 Upload completed, result:', uploadedFile);

        console.log('🔄 Updating local files state...');
        setFiles(prev => [uploadedFile, ...prev]);

        console.log('✅ File added to local state');
        Alert.alert('Success', 'File uploaded successfully to Cloudflare R2!');
        console.log('🎉 Upload process complete!');
      } else {
        console.log('❌ User cancelled file picker');
      }
    } catch (error) {
      console.error('💥 UI Upload error:', error);
      Alert.alert('Error', 'Failed to upload file. Please check your connection.');
    } finally {
      console.log('🔄 Setting upload state to false');
      setUploading(false);
    }
  };

  const downloadFile = async (file: FileInfo) => {
    console.log('📥 Starting download for file:', file.name);
    console.log('🗝️ File key:', file.key);

    try {
      console.log('🔗 Getting download URL from R2...');
      // Download from Cloudflare R2
      const downloadUrl = await R2Service.downloadFile(file.key);

      console.log('🌐 Download URL:', downloadUrl);

      if (await Sharing.isAvailableAsync()) {
        console.log('📤 Opening share dialog...');
        await Sharing.shareAsync(downloadUrl, {
          mimeType: getMimeType(file.name),
          dialogTitle: `Download ${file.name}`,
        });
        console.log('✅ File shared/downloaded successfully');
      } else {
        console.log('❌ Sharing not available on this device');
        Alert.alert('Download', 'Sharing not available on this device');
      }
    } catch (error) {
      console.error('💥 Download error:', error);
      Alert.alert('Error', 'Failed to download file. Please try again.');
    }
  };

  const deleteFile = async (file: FileInfo) => {
    console.log('🗑️ Delete initiated for file:', file.name);
    console.log('🗝️ File key to delete:', file.key);

    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('❌ Delete cancelled by user')
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('✅ User confirmed delete, proceeding...');
            try {
              console.log('🗑️ Calling R2Service.deleteFile...');
              // Delete from Cloudflare R2
              await R2Service.deleteFile(file.key);

              console.log('✅ File deleted from R2 successfully');

              console.log('🔄 Removing from local state...');
              // Remove from local state
              setFiles(prev => prev.filter(f => f.id !== file.id));
              setActionModalVisible(false);

              console.log('✅ Local state updated, modal closed');
              Alert.alert('Success', 'File deleted successfully from Cloudflare R2!');
              console.log('🎉 Delete operation complete!');
            } catch (error) {
              console.error('💥 Delete error:', error);
              Alert.alert('Error', 'Failed to delete file. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderFileItem = ({ item }: { item: FileInfo }) => (
    <TouchableOpacity
      style={styles.fileItem}
      onPress={() => {
        setSelectedFile(item);
        setActionModalVisible(true);
      }}
    >
      <View style={styles.fileIcon}>
        <Text style={styles.fileIconText}>{getFileIcon(item.type)}</Text>
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.fileMeta}>
          {item.size} • {item.uploadedAt}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => {
          setSelectedFile(item);
          setActionModalVisible(true);
        }}
      >
        <MaterialIcons name="more-vert" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📁 Files</Text>
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={uploadFile}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={16} color="white" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search files..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Files List */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading files...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFiles}
          renderItem={renderFileItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.filesList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cloud-offline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No files found</Text>
              <Text style={styles.emptyStateSubtitle}>
              Upload your first file to Cloudflare R2
              </Text>
            </View>
          }
        />
      )}

      {/* File Actions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {selectedFile && (
              <>
                <View style={styles.filePreview}>
                  <Text style={styles.previewIcon}>{getFileIcon(selectedFile.type)}</Text>
                  <Text style={styles.previewName} numberOfLines={2}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.previewMeta}>
                    {selectedFile.size} • {selectedFile.uploadedAt}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      downloadFile(selectedFile);
                      setActionModalVisible(false);
                    }}
                  >
                    <Ionicons name="download" size={20} color="#3B82F6" />
                    <Text style={styles.actionButtonText}>Download</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      // Share file link
                      if (selectedFile.url) {
                        Sharing.shareAsync(selectedFile.url, {
                          dialogTitle: `Share ${selectedFile.name}`,
                        }).catch(error => {
                          console.error('Share error:', error);
                          Alert.alert('Error', 'Failed to share file');
                        });
                      }
                      setActionModalVisible(false);
                    }}
                  >
                    <Ionicons name="share" size={20} color="#10B981" />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteActionButton]}
                    onPress={() => deleteFile(selectedFile)}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fileIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  fileMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  filePreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  deleteActionButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteActionText: {
    color: '#DC2626',
  },
});
