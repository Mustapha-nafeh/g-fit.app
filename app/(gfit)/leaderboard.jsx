import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ActivityContinuation() {
  const todayActivities = [
    {
      id: 1,
      name: "Family's name",
      description: "lorem upsum",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
    },
    {
      id: 2,
      name: "Family's name",
      description: "lorem upsum",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
    },
    {
      id: 3,
      name: "Family's name",
      description: "lorem upsum",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
    },
    {
      id: 4,
      name: "Family's name",
      description: "lorem upsum",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
    },
  ];

  const thisWeekActivities = [
    {
      id: 5,
      name: "Family's name",
      description: "lorem upsum",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop",
    },
    {
      id: 6,
      name: "Family's name",
      description: "lorem upsum",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
    },
  ];

  const handleVisitProfile = (activityId) => {
    console.log("Visit profile:", activityId);
    // router.push(`/profile/${activityId}`);
  };

  const handleSearch = () => {
    console.log("Search pressed");
    // router.push('/search');
  };

  const handleTrophy = () => {
    console.log("Trophy pressed");
    // router.push('/achievements');
  };

  const ActivityCard = ({ activity }) => (
    <View className="flex-row items-center py-4">
      <Image source={{ uri: activity.image }} className="w-16 h-16 rounded-2xl mr-4" resizeMode="cover" />
      <View className="flex-1">
        <Text className="text-white text-lg font-semibold mb-1">{activity.name}</Text>
        <Text className="text-gray-400 text-sm">{activity.description}</Text>
      </View>
      <TouchableOpacity onPress={() => handleVisitProfile(activity.id)} className="bg-gray-300 rounded-full px-4 py-2">
        <Text className="text-gray-800 font-medium text-sm">Visit Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#2D1B69" />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-6">
          {/* Header */}
          <View className="flex-row justify-between items-start pt-4 mb-8">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold leading-tight">Let's continue{"\n"}your activity</Text>
            </View>
            <View className="flex-row mt-2 space-x-4">
              <TouchableOpacity onPress={handleTrophy}>
                <Ionicons name="trophy-outline" size={28} color="#F59E0B" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSearch}>
                <Ionicons name="search-outline" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Activities */}
          <View className="mb-8">
            {todayActivities.map((activity, index) => (
              <View key={activity.id}>
                <ActivityCard activity={activity} />
                {index < todayActivities.length - 1 && (
                  <View className="h-px ml-20" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
                )}
              </View>
            ))}
          </View>

          {/* This Week Section */}
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold mb-6">This Week</Text>

            {thisWeekActivities.map((activity, index) => (
              <View key={activity.id}>
                <ActivityCard activity={activity} />
                {index < thisWeekActivities.length - 1 && (
                  <View className="h-px ml-20" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
                )}
              </View>
            ))}
          </View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
