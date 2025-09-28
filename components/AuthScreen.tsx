import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { db } from "@/lib/db";

type AuthScreenProps = {
  onSignIn?: () => void;
};

export default function AuthScreen({ onSignIn }: AuthScreenProps) {
  return (
    <View className="flex-1 justify-center p-4 bg-white">
      <EmailStep onSignIn={onSignIn} />
    </View>
  );
}

function EmailStep({ onSignIn }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await db.auth.sendMagicCode({ email });
      setSentEmail(email);
    } catch (err: any) {
      Alert.alert("Error", err.body?.message || "Failed to send magic code");
    } finally {
      setLoading(false);
    }
  };

  if (sentEmail) {
    return <CodeStep sentEmail={sentEmail} onSignIn={onSignIn} />;
  }

  return (
    <View className="space-y-4 bg-white p-4 rounded-lg">
      <Text className="text-xl font-bold text-center mb-4 text-gray-800">Welcome!</Text>
      <Text className="text-gray-600 text-center mb-4">
        Enter your email, and we'll send you a verification code. We'll create
        an account for you too if you don't already have one.
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 px-3 py-3 w-full rounded-md bg-white text-gray-800"
        editable={!loading}
      />
      <Button 
        title={loading ? "Sending..." : "Send Code"} 
        onPress={handleSendCode} 
        disabled={loading}
      />
    </View>
  );
}

function CodeStep({ sentEmail, onSignIn }: AuthScreenProps & { sentEmail: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
      onSignIn?.();
    } catch (err: any) {
      Alert.alert("Error", err.body?.message || "Invalid code");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await db.auth.sendMagicCode({ email: sentEmail });
      Alert.alert("Success", "Code resent successfully");
    } catch (err: any) {
      Alert.alert("Error", err.body?.message || "Failed to resend code");
    }
  };

  return (
    <View className="space-y-4 bg-white p-4 rounded-lg">
      <Text className="text-xl font-bold text-center mb-4 text-gray-800">Enter your code</Text>
      <Text className="text-gray-600 text-center mb-4">
        We sent an email to <Text className="font-bold">{sentEmail}</Text>. Check your email, and
        paste the code you see.
      </Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="123456..."
        className="border border-gray-300 px-3 py-3 w-full rounded-md bg-white text-gray-800"
        editable={!loading}
      />
      <Button 
        title={loading ? "Verifying..." : "Verify Code"} 
        onPress={handleVerifyCode} 
        disabled={loading}
      />
      <Button 
        title="Resend Code" 
        onPress={handleResendCode} 
        disabled={loading}
      />
    </View>
  );
}