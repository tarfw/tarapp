import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import db from '../../lib/db';
import { useAuth } from '../../lib/auth';

export default function VerifyCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { updateUser } = useAuth(); // Get the updateUser function to update context manually

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the magic code');
      return;
    }

    setLoading(true);
    try {
      const result = await db.auth.signInWithMagicCode({
        email: email as string,
        code,
      });
      
      // Manually update the auth context after successful login
      // This ensures that when we navigate, the auth state is already updated
      const auth = await db.getAuth();
      updateUser(auth?.user || null);
      
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Verify Code</Text>
      <Text style={styles.subtitle}>
        Enter the magic code sent to {email}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter code"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        maxLength={6}
      />
      
      <Button 
        title={loading ? 'Verifying...' : 'Verify Code'} 
        onPress={handleVerifyCode} 
        disabled={loading}
      />
      
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Didn't receive a code?{' '}
          <Text style={styles.resendLink} onPress={handleResendCode}>
            Resend
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});