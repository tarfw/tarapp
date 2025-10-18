import React from 'react';
import { View, StyleSheet, ViewStyle, Image } from 'react-native';

interface AppLogoProps {
  style?: ViewStyle;
}

const AppLogo = ({ style }: AppLogoProps) => {
  return (
    <View style={[styles.logoContainer, style]}>
      <Image source={require('../assets/images/tarlogo.png')} style={styles.logoImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center', // Center the logo
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 10,
  },
});

export default AppLogo;