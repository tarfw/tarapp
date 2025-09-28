import { db } from "@/lib/db";
import { Redirect } from "expo-router";

export default function App() {
  const { isLoading, user } = db.useAuth();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }
  
  // If user is already signed in, redirect to tabs
  if (user) {
    return <Redirect href="/(tabs)/" />;
  } else {
    return <Redirect href="/auth" />;
  }
}
