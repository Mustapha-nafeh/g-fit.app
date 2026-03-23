"use client";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Clipboard,
  Linking,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getShareableWorkoutLinks } from "../../utils/deepLinks";
import { useGetWorkoutById } from "../../api/gtkfApi";
import { showToast } from "../../constants";
import BunnyVideoPlayer from "../../global-components/BunnyVideoPlayer";

// ─── Pill badge ──────────────────────────────────────────────────────────────
const Badge = ({ icon, label, color = "#10B981", bg = "#D1FAE5" }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: bg,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    }}
  >
    <Ionicons name={icon} size={13} color={color} />
    <Text style={{ color, fontSize: 12, fontWeight: "600", marginLeft: 4 }}>{label}</Text>
  </View>
);

// ─── Icon action button ───────────────────────────────────────────────────────
const IconBtn = ({ icon, onPress, active, activeColor = "#EC4899", size = 20 }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: active ? activeColor + "18" : "#F3F4F6",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Ionicons name={icon} size={size} color={active ? activeColor : "#6B7280"} />
  </TouchableOpacity>
);

// ─── Exercise row ─────────────────────────────────────────────────────────────
const ExerciseRow = ({ exercise, index }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    }}
  >
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: "#0EA5E910",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#0EA5E9" }}>{index + 1}</Text>
    </View>
    <Text style={{ flex: 1, fontSize: 15, color: "#1F2937", fontWeight: "500" }}>
      {exercise.name || exercise.title}
    </Text>
    {(exercise.duration || exercise.time) && (
      <Text style={{ fontSize: 13, color: "#9CA3AF" }}>{exercise.duration || exercise.time}</Text>
    )}
  </View>
);

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const LoadingState = () => (
  <View style={{ flex: 1, backgroundColor: "#0F172A", alignItems: "center", justifyContent: "center" }}>
    <ActivityIndicator size="large" color="#0EA5E9" />
    <Text style={{ color: "#94A3B8", marginTop: 16, fontSize: 15 }}>Loading workout…</Text>
  </View>
);

// ─── Error state ──────────────────────────────────────────────────────────────
const ErrorState = () => (
  <View style={{ flex: 1, backgroundColor: "#0F172A", alignItems: "center", justifyContent: "center", padding: 32 }}>
    <View
      style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
    </View>
    <Text style={{ color: "white", fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "center" }}>
      Failed to Load
    </Text>
    <Text style={{ color: "#94A3B8", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
      Something went wrong fetching workout details. Please try again.
    </Text>
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ backgroundColor: "#1E293B", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 }}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function WorkoutPage() {
  const { slug } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // ✅ Fixed: use query, not mutation
  const { data, isLoading, isError } = useGetWorkoutById(slug, {
    enabled: !!slug,
    onError: () => showToast("error", "Error", "Failed to load workout details"),
  });

  const workout = data?.data ?? null;
  const videoId = workout?.video_id ?? workout?.bunny_video_id ?? null;

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!workout) return;
    try {
      const { appLink } = getShareableWorkoutLinks(slug, workout);
      await Share.share({
        message: `🏃 Check out "${workout.title}" on GTKF!\n\n${workout.description}\n\n${appLink}`,
        title: workout.title,
        url: appLink,
      });
    } catch {
      Alert.alert("Error", "Failed to share workout.");
    }
  };

  const handleCopyLink = async () => {
    if (!workout || !slug) return;
    try {
      const { appLink } = getShareableWorkoutLinks(slug, workout);
      await Clipboard.setString(appLink);
      showToast("success", "Copied!", "Workout link copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy link.");
    }
  };

  const openVideo = async () => {
    const videoUrl = workout?.video_url || workout?.videoUrl;
    if (!videoUrl) {
      Alert.alert("No Video", "This workout doesn't have a video yet.");
      return;
    }
    try {
      const ok = await Linking.canOpenURL(videoUrl);
      if (ok) await Linking.openURL(videoUrl);
      else Alert.alert("Error", "Unable to open video.");
    } catch {
      Alert.alert("Error", "Failed to open video.");
    }
  };

  // ─── Render guards ────────────────────────────────────────────────────────
  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;

  const hasVideo = !!(workout?.video_url || workout?.videoUrl);
  const hasEmbeddedVideo = !!videoId;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F172A" }} edges={["top"]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ── Top nav ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1E293B",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              gap: 4,
            }}
          >
            <Ionicons name="chevron-back" size={18} color="white" />
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#1E293B",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="share-outline" size={19} color="white" />
          </TouchableOpacity>
        </View>

        {/* ── Hero: Bunny video player OR static image thumb ── */}
        <View style={{ marginHorizontal: 20, marginBottom: 6 }}>
          {videoId ? (
            <BunnyVideoPlayer videoId={videoId} style={{ height: 240, borderRadius: 24 }} />
          ) : (
            <TouchableOpacity onPress={openVideo} activeOpacity={0.9}>
              <View
                style={{
                  height: 300,
                  borderRadius: 24,
                  overflow: "hidden",
                  backgroundColor: "#1E293B",
                }}
              >
                {workout?.image ? (
                  <Image source={{ uri: workout.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="barbell-outline" size={48} color="#334155" />
                  </View>
                )}

                {/* Gradient overlay */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.55)"]}
                  style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120 }}
                />

                {/* Play button */}
                <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: "rgba(255,255,255,0.18)",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1.5,
                      borderColor: "rgba(255,255,255,0.35)",
                    }}
                  >
                    <Ionicons name="play" size={28} color="white" style={{ marginLeft: 3 }} />
                  </View>
                </View>

                {/* Video badge */}
                {hasVideo && (
                  <View
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="videocam" size={12} color="#0EA5E9" />
                    <Text style={{ color: "white", fontSize: 11, fontWeight: "600", marginLeft: 4 }}>Video</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ── White card content ── */}
        <View
          style={{
            backgroundColor: "white",
            marginHorizontal: 0,
            marginTop: 12,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 28,
            paddingHorizontal: 24,
            minHeight: 500,
          }}
        >
          {/* Title row */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 14 }}>
            <Text style={{ flex: 1, fontSize: 24, fontWeight: "800", color: "#0F172A", lineHeight: 30 }}>
              {workout?.title || workout?.name || "Workout"}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginLeft: 12 }}>
              <IconBtn
                icon={isFavorite ? "heart" : "heart-outline"}
                onPress={() => setIsFavorite((v) => !v)}
                active={isFavorite}
                activeColor="#EC4899"
              />
              <IconBtn icon="copy-outline" onPress={handleCopyLink} />
            </View>
          </View>

          {/* Badges */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            {workout?.duration && (
              <Badge icon="time-outline" label={`${workout.duration} mins`} color="#0EA5E9" bg="#E0F2FE" />
            )}
            {(workout?.difficulty || workout?.difficulty_level) && (
              <Badge
                icon="fitness-outline"
                label={workout.difficulty || workout.difficulty_level}
                color="#F59E0B"
                bg="#FEF3C7"
              />
            )}
            {workout?.exercises?.length > 0 && (
              <Badge icon="list-outline" label={`${workout.exercises.length} exercises`} color="#8B5CF6" bg="#EDE9FE" />
            )}
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#F1F5F9", marginBottom: 20 }} />

          {/* Description */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#64748B",
              letterSpacing: 0.8,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            About
          </Text>
          <Text style={{ fontSize: 15, color: "#374151", lineHeight: 24, marginBottom: 28 }}>
            {workout?.description ||
              workout?.content ||
              "A comprehensive workout designed to help you stay fit and healthy. Perfect for all fitness levels."}
          </Text>

          {/* Exercise list */}
          {workout?.exercises?.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#64748B",
                  letterSpacing: 0.8,
                  marginBottom: 4,
                  textTransform: "uppercase",
                }}
              >
                Exercises
              </Text>
              {workout.exercises.map((exercise, index) => (
                <ExerciseRow key={index} exercise={exercise} index={index} />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 34,
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
        }}
      >
        {/* Start button — only shown when using external video link, not Bunny embed */}
        {!hasEmbeddedVideo && (
          <TouchableOpacity
            onPress={openVideo}
            style={{
              backgroundColor: "#0EA5E9",
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#0EA5E9",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Ionicons name="play-circle-outline" size={22} color="white" />
            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>Start Workout</Text>
          </TouchableOpacity>
        )}

        {/* Secondary row */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 28, marginTop: 14 }}>
          <TouchableOpacity
            onPress={() => setIsFavorite((v) => !v)}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={17}
              color={isFavorite ? "#EC4899" : "#9CA3AF"}
            />
            <Text style={{ fontSize: 13, color: isFavorite ? "#EC4899" : "#9CA3AF", fontWeight: "500" }}>
              {isFavorite ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="share-outline" size={17} color="#9CA3AF" />
            <Text style={{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" }}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCopyLink} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="copy-outline" size={17} color="#9CA3AF" />
            <Text style={{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" }}>Copy Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
