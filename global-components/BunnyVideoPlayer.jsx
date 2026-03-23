import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { useGetVideoToken } from "../api/gtkfApi";

/**
 * BunnyVideoPlayer
 *
 * Fetches a signed Bunny Stream URL from the backend, then plays it
 * using expo-video's VideoView.
 *
 * Props:
 *   videoId  – the Bunny video ID stored on the workout object
 *   style    – optional extra style for the outer container
 */
export default function BunnyVideoPlayer({ videoId, style }) {
  const { data, isLoading, isError, refetch } = useGetVideoToken(videoId, !!videoId);

  const signedUrl = data?.url ?? null;

  const player = useVideoPlayer(signedUrl ? { uri: signedUrl } : null, (p) => {
    p.loop = false;
    p.muted = false;
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.statusText}>Loading video…</Text>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError || !signedUrl) {
    return (
      <View style={[styles.container, style]}>
        <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load video</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Player ───────────────────────────────────────────────────────────────
  return (
    <View style={[styles.playerContainer, style]}>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    gap: 10,
  },
  playerContainer: {
    height: 240,
    backgroundColor: "#000",
    borderRadius: 24,
    overflow: "hidden",
  },
  video: {
    flex: 1,
  },
  statusText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
    fontWeight: "600",
  },
  retryBtn: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
});
