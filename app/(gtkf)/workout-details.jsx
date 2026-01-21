import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Share, Clipboard, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { getShareableWorkoutLinks } from "../../utils/deepLinks";

export default function WorkoutPage() {
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Demo workout data - replace with actual API call
  const workoutsList = [
    {
      id: "1",
      title: "Full Body Kids Workout",
      description: "A fun and engaging full body workout designed specifically for kids.",
      duration: 15,
      difficulty: "Beginner",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Demo video URL
      exercises: [
        { name: "Jumping Jacks", duration: "30 seconds" },
        { name: "Bear Crawl", duration: "30 seconds" },
        { name: "Mountain Climbers", duration: "30 seconds" },
      ],
    },
    {
      id: "2",
      title: "Cardio Fun Time",
      description: "Get your heart pumping with these fun cardio exercises.",
      duration: 20,
      difficulty: "Intermediate",
      videoUrl: "https://www.youtube.com/watch?v=L_jWHffIx5E", // Demo video URL
      exercises: [
        { name: "High Knees", duration: "45 seconds" },
        { name: "Burpees", duration: "30 seconds" },
        { name: "Jump Rope", duration: "60 seconds" },
      ],
    },
  ];

  useEffect(() => {
    const found = workoutsList.find((w) => w.id === "1");
    setWorkout(found);
  }, []);

  const handleBack = () => {
    router.back();
  };

  // Handle adding/removing from favorites
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? "Removed from Favorites" : "Added to Favorites",
      isFavorite
        ? "This workout has been removed from your favorites."
        : "This workout has been added to your favorites!"
    );
  };

  // Handle sharing the workout
  const handleShare = async () => {
    if (!workout) {
      Alert.alert("Error", "Workout not found");
      return;
    }

    try {
      const { appLink, webLink } = getShareableWorkoutLinks(id, workout);

      const shareMessage = `🏃‍♀️ Check out this amazing workout: ${workout.title}!

⏱️ Duration: ${workout.duration} minutes
📊 Difficulty: ${workout.difficulty}

📝 ${workout.description}

📱 Open in GTKF app: ${appLink}
🌐 Or visit online: ${webLink}

#GTKF #KidsWorkout #Fitness`;

      const result = await Share.share({
        message: shareMessage,
        title: `${workout.title} - GTKF Kids Workout`,
        url: appLink, // iOS will use this as the primary link
      });

      if (result.action === Share.sharedAction) {
        console.log("Workout shared successfully");
        Alert.alert("Shared! 🎉", "Workout link has been shared successfully");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share workout. Please try again.");
    }
  };

  // Handle copying workout link to clipboard
  const handleCopyLink = async () => {
    if (!workout || !id) {
      Alert.alert("Error", "Workout not found");
      return;
    }

    try {
      const { appLink } = getShareableWorkoutLinks(id, workout);
      await Clipboard.setString(appLink);
      Alert.alert("Copied! 📋", "Workout link has been copied to clipboard");
    } catch (error) {
      console.error("Copy error:", error);
      Alert.alert("Error", "Failed to copy link. Please try again.");
    }
  };

  // Handle playing workout video
  const handlePlayVideo = async () => {
    if (!workout?.videoUrl) {
      Alert.alert("No Video Available", "This workout does not have a video tutorial yet.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(workout.videoUrl);
      if (supported) {
        await Linking.openURL(workout.videoUrl);
      } else {
        Alert.alert("Error", "Unable to open video. Please try again later.");
      }
    } catch (error) {
      console.error("Error opening video:", error);
      Alert.alert("Error", "Failed to open video. Please check your connection and try again.");
    }
  };

  // Handle starting the workout
  const handleStartWorkout = async () => {
    if (!workout?.videoUrl) {
      Alert.alert("No Video Available", "This workout does not have a video tutorial yet.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(workout.videoUrl);
      if (supported) {
        await Linking.openURL(workout.videoUrl);
      } else {
        Alert.alert("Error", "Unable to open workout video. Please try again later.");
      }
    } catch (error) {
      console.error("Error opening workout video:", error);
      Alert.alert("Error", "Failed to open workout video. Please check your connection and try again.");
    }
  };

  const relatedArticles = [
    {
      id: 1,
      placeholder: "Exercise Image 1",
    },
    {
      id: 2,
      placeholder: "Exercise Image 2",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-800" edges={["top"]}>
      <ScrollView className="flex-1 pb-32">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity onPress={handleBack} className="mt-0.5">
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Workout Details</Text>
          </View>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Main Workout Image with Play Button */}
        <TouchableOpacity onPress={handlePlayVideo} activeOpacity={0.8}>
          <View className="mx-6 mb-4 bg-gray-300 rounded-2xl h-80 items-center justify-center relative">
            {/* Background content */}
            <Text className="text-gray-500 text-lg font-medium">{workout?.title || "Workout Image"}</Text>
            <Text className="text-gray-400 text-sm mt-2">{workout?.difficulty || "Difficulty Level"}</Text>

            {/* Play Button Overlay */}
            <View className="absolute inset-0 items-center justify-center">
              <View className="bg-black/60 rounded-full p-4 shadow-lg">
                <View className="bg-white rounded-full p-3">
                  <Ionicons name="play" size={32} color="#374151" style={{ marginLeft: 3 }} />
                </View>
              </View>
            </View>

            {/* Video indicator */}
            <View className="absolute top-4 right-4 bg-black/70 px-2 py-1 rounded-full flex-row items-center">
              <Ionicons name="videocam" size={14} color="white" />
              <Text className="text-white text-xs ml-1">Video</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Article Content Section */}
        <View className="bg-white flex-1 rounded-3xl pt-6  mb-10">
          {/* Article Header */}
          <View className="px-6 mb-4">
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-gray-900 text-2xl font-bold flex-1">{workout?.title || "Workout Title"}</Text>
              <View className="flex-row space-x-2 ml-4">
                <TouchableOpacity
                  onPress={handleToggleFavorite}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isFavorite ? "bg-pink-500" : "bg-gray-200"
                  }`}
                >
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={20}
                    color={isFavorite ? "white" : "gray"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
                >
                  <Ionicons name="share-outline" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration and Difficulty */}
            <View className="flex-row items-center mb-6 space-x-4">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#10B981" />
                <Text className="text-gray-600 ml-1 font-medium">
                  {workout?.duration ? `${workout.duration} mins` : "Duration: N/A"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="fitness-outline" size={16} color="#EAB308" />
                <Text className="text-gray-600 ml-1 font-medium">{workout?.difficulty || "Beginner"}</Text>
              </View>
            </View>
          </View>

          {/* Workout Description */}
          <View className="px-6 mb-8">
            <Text className="text-gray-600 text-base leading-6 mb-4">
              {workout?.description ||
                "This is a comprehensive workout designed to help you stay fit and healthy. Perfect for all fitness levels."}
            </Text>

            {/* Exercise List */}
            {workout?.exercises && (
              <View>
                <Text className="text-gray-900 text-lg font-bold mb-3">Exercises:</Text>
                {workout.exercises.map((exercise, index) => (
                  <View key={index} className="flex-row items-center justify-between py-2 border-b border-gray-100">
                    <Text className="text-gray-700 text-base">{exercise.name}</Text>
                    <Text className="text-gray-500 text-sm">{exercise.duration}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="bg-white px-6 pb-6 pt-4 ">
        <TouchableOpacity
          onPress={handleStartWorkout}
          className="py-4 rounded-2xl items-center bg-cyan-400"
        >
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-gray-700">Start Workout</Text>
          </View>
        </TouchableOpacity>

        {/* Secondary Actions */}
        <View className="flex-row justify-center items-center mt-4 space-x-4">
          <TouchableOpacity onPress={handleToggleFavorite} className="flex-row items-center">
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? "#EC4899" : "#9CA3AF"}
            />
            <Text className={`ml-1 text-sm ${isFavorite ? "text-pink-500" : "text-gray-400"}`}>
              {isFavorite ? "Favorited" : "Favorite"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} className="flex-row items-center">
            <Ionicons name="share-outline" size={18} color="#9CA3AF" />
            <Text className="ml-1 text-sm text-gray-400">Share</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCopyLink} className="flex-row items-center">
            <Ionicons name="copy-outline" size={18} color="#9CA3AF" />
            <Text className="ml-1 text-sm text-gray-400">Copy Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
