import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppLogo = () => {
  return (
    <View style={styles.logoContainer}>
      <View style={[styles.logoItem, styles.circle]} />
      <View style={[styles.logoItem, styles.square]} />
      <Text style={styles.atSymbolText}>@</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoItem: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  circle: {
    backgroundColor: 'red',
    borderRadius: 12, // Half of width/height for circle
  },
  square: {
    backgroundColor: 'blue',
    borderRadius: 6, // Rounded corners for the square
  },
  atSymbolText: {
    fontSize: 24,
    color: 'lightgrey',
    fontWeight: 'bold',
  },
});

export default AppLogo;