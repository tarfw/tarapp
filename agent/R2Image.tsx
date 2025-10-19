import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Simple in-memory cache for signed URLs - permanent cache (no expiry)
const urlCache = new Map<string, string>();

interface R2ImageProps {
  url: string;
  style?: any;
  fallback?: React.ReactNode;
  onError?: (error: any) => void;
  onLoad?: () => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'; // For backward compatibility
}

export default function R2Image({
  url,
  fallback,
  onError,
  onLoad,
  style,
  resizeMode,
  ...props
}: R2ImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const loadImageUrl = async () => {
      if (!url) {
        setLoading(false);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError(false);

      try {
        // Check cache first - permanent cache (no expiry)
        const cached = urlCache.get(url);
        if (cached) {
          setSignedUrl(cached);
          setLoading(false);
          return;
        }

        // For images, use the direct public URL (following tarsilvers-main approach)
        // Assuming the bucket is public and images can be accessed directly
        if (!abortController.signal.aborted) {
          setSignedUrl(url);
          urlCache.set(url, url);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(true);
          onError?.(err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadImageUrl();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, onError]);

  // Convert resizeMode for React Native Image
  const getResizeMode = (mode?: string) => {
    switch (mode) {
      case "cover": return "cover";
      case "contain": return "contain";
      case "stretch": return "stretch";
      case "repeat": return "repeat";
      case "center": return "center";
      default: return "cover";
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <MaterialIcons name="image" size={48} color="#9CA3AF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !signedUrl) {
    return fallback || (
      <View style={[styles.errorContainer, style]}>
        <MaterialIcons name="broken-image" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: signedUrl }}
      style={style}
      resizeMode={getResizeMode(resizeMode)}
      onError={(e) => {
        setError(true);
        onError?.(e);
      }}
      onLoad={() => {
        onLoad?.();
      }}
    />
  );
}



const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 8,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 8,
  },
});
