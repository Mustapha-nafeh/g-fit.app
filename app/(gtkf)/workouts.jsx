import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useGetWorkouts } from "../../api/gtkfApi";
import { showToast } from "../../constants";
import useFilterData from "../../hooks/useFilter";
import GtkfHeader from "../../global-components/GtkfHeader";

// Mock categories - replace with API call if needed
const workoutCategories = [
  { id: "all", name: "New workouts", icon: null, active: true },
  { id: "cardio", name: "Cardio", icon: "heart-outline" },
  { id: "flexibility", name: "Flexibility", icon: "body-outline" },
  { id: "strength", name: "Strength", icon: "barbell-outline" },
  { id: "yoga", name: "Yoga", icon: "leaf-outline" },
];

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { mutate, data, isLoading, isError } = useGetWorkouts();

  // Initialize filter hook
  const { filterFields, setFilterFields, filteredData } = useFilterData(workouts, {
    category: selectedCategory === "all" ? "" : selectedCategory,
  });

  // Fetch workouts on component mount
  useEffect(() => {
    mutate(
      { type: "kids" },
      {
        onSuccess: (data) => {
          console.log("Workouts fetched successfully:", data);
          setWorkouts(data.data || []);
        },
        onError: (error) => {
          console.error("Error fetching Workouts:", error);
          showToast("error", "Error", error.response?.data?.message || "An error occurred");
        },
      }
    );
  }, []);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setFilterFields("category", categoryId === "all" ? "" : categoryId);
  };

  // Handle workout item press
  const handleWorkoutPress = (workoutId) => {
    router.push(`/(gtkf)/workout-details?id=${workoutId}`);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar style="light" />
      <View className="flex-1">
        {/* Header with Navigation */}
        <GtkfHeader title="Kids Workouts" currentTab="workouts" />

        {/* Get Kids Fit Banner - Image Placeholder */}
        <View className="mx-6 mb-6 bg-gray-300 rounded-2xl h-48 items-center justify-center">
          <Image source={require("../../assets/getthekidsfit.png")} />
        </View>

        {/* White Background Section - Full Height */}
        <View className="bg-white flex-1 py-6">
          {/* Category Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-6 max-h-12">
            <View className="flex-row space-x-3">
              {workoutCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategorySelect(category.id)}
                  className={`px-4 py-2 rounded-full flex-row items-center ${
                    selectedCategory === category.id ? "bg-green-200" : "bg-transparent"
                  }`}
                >
                  {category.icon && (
                    <Ionicons
                      name={category.icon}
                      size={16}
                      color={selectedCategory === category.id ? "#374151" : "#9CA3AF"}
                      className="mr-1"
                    />
                  )}
                  <Text
                    className={`font-medium ml-1 ${
                      selectedCategory === category.id ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Workouts List */}
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between items-center mb-4">
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-gtkfText text-2xl font-bold"
              >
                Most Popular
              </Text>
              <TouchableOpacity>
                <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-gray-400">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {isLoading && (
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-gray-400 text-lg">Loading workouts...</Text>
              </View>
            )}

            {/* Error State */}
            {isError && (
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-red-500 text-lg mb-4">Failed to load workouts</Text>
                <TouchableOpacity onPress={() => mutate({ type: "kids" })} className="bg-blue-500 px-6 py-3 rounded-lg">
                  <Text className="text-white font-medium">Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Workout Cards */}
            {!isLoading && !isError && (
              <View className="space-y-4 pb-6">
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map((workout) => (
                    <TouchableOpacity
                      key={workout.id}
                      onPress={() => handleWorkoutPress(workout.id)}
                      className="bg-white rounded-2xl py-4 flex-row items-center shadow-sm border border-gray-100"
                      activeOpacity={0.7}
                    >
                      <View className="w-20 h-20 bg-gray-200 rounded-2xl mr-4 items-center justify-center">
                        {workout.image ? (
                          <Image
                            source={{ uri: workout.image }}
                            className="w-full h-full rounded-2xl"
                            resizeMode="cover"
                          />
                        ) : (
                          <Text className="text-gray-400 text-xs text-center">Image{"\n"}Placeholder</Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-black text-lg font-bold mb-1">
                          {workout.title || workout.name || "Workout Title"}
                        </Text>
                        <Text className="text-gray-600 text-sm leading-4" numberOfLines={2}>
                          {workout.description || "Workout description..."}
                        </Text>
                        {workout.duration && (
                          <Text className="text-green-600 text-xs mt-1">Duration: {workout.duration} mins</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleWorkoutPress(workout.id)}
                        className="bg-gtkfText px-4 py-3 rounded-full ml-2"
                      >
                        <Text className="font-medium text-sm text-white">Start</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="flex-1 items-center justify-center py-12">
                    <Text className="text-gray-400 text-lg mt-4">
                      {selectedCategory === "all" ? "No workouts available" : `No ${selectedCategory} workouts found`}
                    </Text>
                    {selectedCategory !== "all" && (
                      <TouchableOpacity onPress={() => handleCategorySelect("all")} className="mt-3">
                        <Text className="text-blue-500 text-sm">Show all workouts</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
