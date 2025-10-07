import { View, Text, StyleSheet } from 'react-native';

export default function CollectionsAgent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎈 Collections Agent</Text>
      <Text style={styles.content}>Collections management interface</Text>
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