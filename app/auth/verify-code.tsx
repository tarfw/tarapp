import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import db from '../../lib/db';
import AppLogo from '../../components/AppLogo';

export default function VerifyCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the magic code');
      return;
    }

    setLoading(true);
    try {
      await db.auth.signInWithMagicCode({
        email: email as string,
        code,
      });
      
      // Navigate to the workspace screen after successful login
      router.replace('/(tabs)/workspace');
    } catch (error: any) {
      console.error('Error verifying magic code:', error);
      Alert.alert('Error', error.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    try {
      await db.auth.sendMagicCode({ email: email as string });
      Alert.alert('Success', 'New magic code sent!');
    } catch (error: any) {
      console.error('Error resending magic code:', error);
      Alert.alert('Error', error.message || 'Failed to resend code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.appName}>tar</Text>
        <Text style={styles.appSubtitle}>Everything App</Text>
        <AppLogo style={styles.logoBelowTitle} />
        
        <Text style={styles.emailText}>
          Enter the code sent to{'\n'}
          <Text style={styles.emailBold}>{email}</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            maxLength={6}
            placeholderTextColor="#999"
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleVerifyCode} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Continue'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive a code?{' '}
          </Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendLink}>Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  appName: {
    fontSize: 48, // Larger font size for H1
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    color: '#000',
  },
  appSubtitle: {
    fontSize: 16, // H3 size
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 10,
    color: '#999', // Light grey color
  },
  logoBelowTitle: {
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  emailText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 24,
  },
  emailBold: {
    fontWeight: '600',
    color: '#000',
  },
  inputContainer: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#007AFF', // Blue color
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    color: '#007AFF', // Blue color
    fontWeight: '600',
    marginLeft: 4,
  },
});