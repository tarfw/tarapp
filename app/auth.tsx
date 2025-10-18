import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from '../lib/db';

export default function Auth() {
  const [sentEmail, setSentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, isLoading } = db.useAuth();

  // If user is already signed in, redirect to workspace
  if (!isLoading && user) {
    return <Redirect href="/(tabs)/workspace" />;
  }

  const handleSendCode = async (email: string) => {
    console.log('Sending magic code to:', email);
    setLoading(true);
    try {
      const result = await db.auth.sendMagicCode({ email });
      console.log('Send magic code result:', result);
      setSentEmail(email);
    } catch (error: any) {
      console.error('Error sending magic code:', error);
      Alert.alert('Error', error.body?.message || 'Failed to send magic code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    setLoading(true);
    try {
      const result = await db.auth.signInWithMagicCode({ email: sentEmail, code });
      console.log('Sign in result:', result);

      // Store refresh token for persistence
      const refreshToken = db.auth.getRefreshToken();
      console.log('Refresh token after sign in:', refreshToken);
      if (refreshToken) {
        await AsyncStorage.setItem('instant_refresh_token', refreshToken);
        console.log('Persisted auth token');
      }

      console.log('Navigating to workspace...');
      // Small delay to allow auth state to update
      setTimeout(() => {
        router.replace('/(tabs)/workspace');
        console.log('Navigation called');
      }, 100);
    } catch (error: any) {
      Alert.alert('Error', error.body?.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {!sentEmail ? (
            <EmailStep onSendCode={handleSendCode} loading={loading} />
          ) : (
            <CodeStep
              sentEmail={sentEmail}
              onVerifyCode={handleVerifyCode}
              onBack={() => setSentEmail('')}
              loading={loading}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EmailStep({
  onSendCode,
  loading
}: {
  onSendCode: (email: string) => void;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    onSendCode(email.trim());
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a verification code.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Send code</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function CodeStep({
  sentEmail,
  onVerifyCode,
  onBack,
  loading
}: {
  sentEmail: string;
  onVerifyCode: (code: string) => void;
  onBack: () => void;
  loading: boolean;
}) {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    onVerifyCode(code.trim());
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We sent a verification code to{'\n'}
        <Text style={styles.emailText}>{sentEmail}</Text>
      </Text>

      <TextInput
        style={styles.codeInput}
        placeholder="123456"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        maxLength={6}
        editable={!loading}
        placeholderTextColor="#9CA3AF"
        textAlign="center"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Use different email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stepContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#000',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    fontSize: 16,
    paddingVertical: 12,
    marginBottom: 32,
    color: '#000',
  },
  codeInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    fontSize: 24,
    paddingVertical: 12,
    marginBottom: 32,
    color: '#000',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
});
