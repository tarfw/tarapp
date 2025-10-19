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
import * as Sharing from 'expo-sharing';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import R2Service, { FileInfo } from '../lib/r2Service';
import R2Image from './R2Image';

// File management with Cloudflare R2 integration

const isImageType = (type: string) => type === 'image' || type === 'oimage';

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return '📄';
    case 'image':
      return '🖼️';
    case 'oimage':
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
      console.log('ℹ️ File listing disabled due to network issues - uploads will still work');
      console.log('ℹ️ Showing empty list but uploads should still work');
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

      const canceled = 'canceled' in result ? result.canceled : result.type !== 'success';
      if (!canceled) {
        const asset = 'assets' in result ? result.assets?.[0] : result;
        if (!asset || !asset.uri) {
          console.log('⚠️ No file asset returned from picker');
          Alert.alert('Error', 'Unable to read selected file.');
          return;
        }

        const fileName = asset.name || asset.uri.split('/').pop() || 'upload';

        console.log('✅ File selected successfully');
        console.log('📄 Selected file:', fileName);
        console.log('📏 File size:', asset.size);
        console.log('🗂️ File MIME type:', asset.mimeType);
        console.log('📍 File URI:', asset.uri);

        setUploading(true);
        console.log('⏳ Setting upload state to true');

        console.log('🚀 Calling R2Service.uploadFile...');
        // Upload to Cloudflare R2
        const uploadedFile = await R2Service.uploadFile({
          uri: asset.uri,
          name: fileName,
          size: asset.size,
          type: asset.mimeType
        });

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
      console.log('🔗 Getting signed URL from R2...');
      // Get signed URL from Cloudflare R2
      const downloadUrl = await R2Service.getSignedUrl(file.key);

      if (!downloadUrl) {
        throw new Error('Failed to generate signed URL');
      }

      console.log('🌐 Signed URL:', downloadUrl);

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
        console.log('📱 Tapping file:', item.name, 'key:', item.key, 'type:', item.type);
        setSelectedFile(item);
        setActionModalVisible(true);
      }}
    >
      <Text style={styles.fileIcon}>{getFileIcon(item.type)}</Text>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.fileMeta}>
          {item.size} • {item.uploadedAt}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          contentContainerStyle={filteredFiles.length === 0 ? styles.emptyListContent : undefined}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cloud-offline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>File listing disabled</Text>
              <Text style={styles.emptyStateSubtitle}>
              Uploads work but listing is disabled due to network issues
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, uploading && styles.fabDisabled]}
        onPress={uploadFile}
        disabled={uploading}
        activeOpacity={0.8}
      >
        {uploading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Ionicons name="add" size={24} color="white" />
        )}
      </TouchableOpacity>

      {/* File Actions Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <SafeAreaView style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setActionModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>File Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedFile && (
            <View style={styles.modalBody}>
              <View style={styles.filePreview}>
                {isImageType(selectedFile.type) ? (
                  <R2Image
                    url={selectedFile.url}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                    onLoad={() => console.log('🖼️ Image loaded successfully')}
                    onError={(error) => console.log('❌ Image failed to load:', error)}
                  />
                ) : (
                  <View style={styles.iconContainer}>
                    <Text style={styles.largeIcon}>{getFileIcon(selectedFile.type)}</Text>
                  </View>
                )}
              </View>

              <View style={styles.bottomActions}>
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
                  onPress={async () => {
                    // Share file link with signed URL
                    if (selectedFile) {
                      const signedUrl = await R2Service.getSignedUrl(selectedFile.key);
                      if (signedUrl) {
                        Sharing.shareAsync(signedUrl, {
                          dialogTitle: `Share ${selectedFile.name}`,
                        }).catch(error => {
                          console.error('Share error:', error);
                          Alert.alert('Error', 'Failed to share file');
                        });
                      } else {
                        Alert.alert('Error', 'Failed to generate share link');
                      }
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
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 12,
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
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
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
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    flex: 1,
  },
  filePreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenImage: {
    flex: 1,
    width: '100%',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeIcon: {
    fontSize: 120,
  },

  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 8,
    minWidth: 80,
    justifyContent: 'center',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabDisabled: {
    backgroundColor: '#9CA3AF',
  },
});
