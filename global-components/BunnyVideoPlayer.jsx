import React from "react";
import { View, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

/**
 * BunnyVideoPlayer
 *
 * Plays a video URL directly — the backend returns the full streamable link
 * as part of the workout data, no separate token fetch needed.
 *
 * Props:
 *   url    – the full video URL from the workout object
 *   style  – optional extra style for the container
 */
export default function BunnyVideoPlayer({ url, style }) {
  const player = useVideoPlayer({ uri: url }, (p) => {
    p.loop = false;
    p.muted = false;
  });

  return (
    <View style={[styles.container, style]}>
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
    backgroundColor: "#000",
    borderRadius: 24,
    overflow: "hidden",
  },
  video: {
    flex: 1,
  },
});
