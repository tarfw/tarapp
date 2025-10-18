import { View, Text, StyleSheet } from 'react-native';

export default function FilesAgent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📁 Files Agent</Text>
      <Text style={styles.content}>File management and storage interface</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    color: '#666',
  },
});
