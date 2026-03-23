import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useGetWorkouts } from "../../api/gtkfApi";
import { showToast } from "../../constants";
import useFilterData from "../../hooks/useFilter";
import GtkfHeader from "../../global-components/GtkfHeader";

// Workout categories for filtering - these should match the tags from API
const workoutCategories = [
  { id: "all", name: "All Workouts", icon: null, active: true },
  { id: "cardio", name: "Cardio", icon: "heart-outline" },
  { id: "strength", name: "Strength", icon: "barbell-outline" },
  { id: "flexibility", name: "Flexibility", icon: "body-outline" },
  { id: "yoga", name: "Yoga", icon: "leaf-outline" },
  { id: "dance", name: "Dance", icon: "musical-notes-outline" },
  { id: "sports", name: "Sports", icon: "basketball-outline" },
];

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetWorkouts("kids");

  // Initialize filter hook - filter by tags field
  const { filterFields, setFilterFields, filteredData } = useFilterData(workouts, {
    tags: selectedCategory === "all" ? "" : selectedCategory,
  });

  // Update workouts when data is fetched
  useEffect(() => {
    if (data?.data) {
      setWorkouts(data.data);
    }
  }, [data]);

  // Show error toast when there's an error
  useEffect(() => {
    if (isError && error) {
      console.error("Error fetching Workouts:", error);
      showToast("error", "Error", error.response?.data?.message || "Failed to load workouts");
    }
  }, [isError, error]);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setFilterFields("tags", categoryId === "all" ? "" : categoryId);
  };

  // Get count of workouts for each category
  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return workouts.length;
    const filtered = workouts.filter(
      (workout) =>
        workout.tags &&
        Array.isArray(workout.tags) &&
        workout.tags.some((tag) => tag.toLowerCase().includes(categoryId.toLowerCase()))
    );
    return filtered.length;
  };

  // Handle workout item press
  const handleWorkoutPress = (workoutSlug) => {
    router.push(`/(gtkf)/workout-details?slug=${workoutSlug}`);
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      showToast("success", "Success", "Workouts refreshed successfully");
    } catch (error) {
      console.error("Error refreshing workouts:", error);
      showToast("error", "Error", "Failed to refresh workouts");
    } finally {
      setRefreshing(false);
    }
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
                    selectedCategory === category.id ? "bg-green-200 border border-green-300" : "bg-gray-100"
                  }`}
                >
                  {category.icon && (
                    <Ionicons
                      name={category.icon}
                      size={16}
                      color={selectedCategory === category.id ? "#059669" : "#6B7280"}
                      className="mr-1"
                    />
                  )}
                  <Text
                    className={`font-medium ml-1 ${
                      selectedCategory === category.id ? "text-green-800" : "text-gray-600"
                    }`}
                  >
                    {category.name}
                  </Text>
                  {/* Show count for each category */}
                  <View
                    className={`ml-2 px-2 py-0.5 rounded-full ${
                      selectedCategory === category.id ? "bg-green-300" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedCategory === category.id ? "text-green-900" : "text-gray-700"
                      }`}
                    >
                      {getCategoryCount(category.id)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Workouts List */}
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className="text-gtkfText text-2xl font-bold"
                >
                  {selectedCategory === "all"
                    ? "All Workouts"
                    : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Workouts`}
                </Text>
                {filteredData && (
                  <Text className="text-gray-500 text-sm mt-1">
                    {filteredData.length} workout{filteredData.length !== 1 ? "s" : ""} found
                  </Text>
                )}
              </View>
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
                <Text className="text-gray-400 text-sm">Please check your connection and try refreshing the page</Text>
              </View>
            )}

            {/* Workout Cards */}
            {!isLoading && !isError && (
              <View className="space-y-3 pb-6">
                {(() => {
                  return null;
                })()}
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map((workout) => (
                    <TouchableOpacity
                      key={workout.id}
                      onPress={() => handleWorkoutPress(workout.slug || workout.id)}
                      className="bg-white rounded-xl p-3 flex-row items-center border border-gray-50"
                      activeOpacity={0.8}
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                    >
                      <View className="w-16 h-16 bg-gray-50 rounded-lg mr-3 overflow-hidden items-center justify-center">
                        {workout.image ? (
                          <Image source={{ uri: workout.image }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                          <Ionicons name="fitness-outline" size={20} color="#9CA3AF" />
                        )}
                      </View>
                      <View className="flex-1 pr-2">
                        <Text className="text-gray-900 text-base font-semibold mb-1" numberOfLines={1}>
                          {workout.title || workout.name || "Workout Title"}
                        </Text>
                        <Text className="text-gray-500 text-sm leading-4 mb-2" numberOfLines={1}>
                          {workout.description || "Workout description"}
                        </Text>
                        <View className="flex-row items-center justify-between">
                          {workout.duration && (
                            <View className="flex-row items-center">
                              <Ionicons name="time-outline" size={12} color="#10B981" />
                              <Text className="text-green-600 text-xs ml-1 font-medium">{workout.duration}min</Text>
                            </View>
                          )}
                          {/* Show first tag */}
                          {workout.tags && workout.tags.length > 0 && (
                            <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                              <Text className="text-gray-600 text-xs font-medium capitalize">{workout.tags[0]}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleWorkoutPress(workout.slug)}
                        className="bg-gray-900 px-4 py-2 rounded-lg"
                      >
                        <Text className="font-medium text-xs text-white">VIEW</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="flex-1 items-center justify-center py-12 px-6">
                    <Text className="text-gray-700 text-lg font-semibold mb-1 text-center">
                      {selectedCategory === "all" ? "No workouts available" : `No ${selectedCategory} workouts`}
                    </Text>
                    <Text className="text-gray-400 text-sm text-center mb-4">
                      {selectedCategory === "all" ? "Check back later for new content" : "Try a different category"}
                    </Text>
                    {selectedCategory !== "all" && (
                      <TouchableOpacity
                        onPress={() => handleCategorySelect("all")}
                        className="bg-gray-100 px-4 py-2 rounded-lg"
                      >
                        <Text className="text-gray-700 text-sm font-medium">View All</Text>
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
