import { db } from "@/lib/db";
import { Redirect } from "expo-router";
import { View } from "react-native";
import AuthScreen from "@/components/AuthScreen";

export default function AuthIndex() {
  const { isLoading, user } = db.useAuth();

  // If user is already signed in, redirect to tabs
  if (!isLoading && user) {
    return <Redirect href="/(tabs)/" />;
  }

  // Show auth screen if not signed in
  if (isLoading) {
    return null; // Show nothing while loading
  }
  
  return <AuthScreen />;
}