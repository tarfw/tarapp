import React, { useState } from 'react';
import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
SafeAreaView,
KeyboardAvoidingView,
Platform,
ActivityIndicator,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import db from '../lib/db';
import AppLogo from '../components/AppLogo';

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
      // Removed dialog, errors logged to console
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    setLoading(true);
    try {
      const result = await db.auth.signInWithMagicCode({ email: sentEmail, code });
      console.log('Sign in result:', result);

      // Note: Refresh token storage not available in this version
      // Auth persistence handled by Instant DB automatically

      console.log('Navigating to workspace...');
      // Small delay to allow auth state to update
      setTimeout(() => {
        router.replace('/(tabs)/workspace');
        console.log('Navigation called');
      }, 100);
    } catch (error: any) {
      console.error('Error verifying magic code:', error);
      // Removed dialog, errors logged to console
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
      console.log('Please enter your email');
      return;
    }
    onSendCode(email.trim());
  };

  return (
    <View style={styles.stepContainer}>
      <AppLogo style={styles.logo} />
      <Text style={styles.appTitle}>Everything app</Text>

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
      console.log('Please enter the verification code');
      return;
    }
    onVerifyCode(code.trim());
  };

  return (
    <View style={styles.stepContainer}>
      <AppLogo style={styles.logo} />
      <Text style={styles.appTitle}>Everything app</Text>

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
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  logo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '500',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
    shadowOpacity: 0.1,
    elevation: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});
