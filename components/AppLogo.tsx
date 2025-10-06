import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AppLogoProps {
  style?: ViewStyle;
}

const AppLogo = ({ style }: AppLogoProps) => {
  return (
    <View style={[styles.logoContainer, style]}>
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
    justifyContent: 'center', // Center the logo
    marginBottom: 20,
  },
  logoItem: {
    width: 24,
    height: 24,
    marginHorizontal: 8, // Increased margin for even spacing
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
    fontSize: 32, // Increased size of @ symbol
    color: 'lightgrey',
    fontWeight: 'bold',
    marginHorizontal: 8, // Added margin for even spacing
  },
});

export default AppLogo;