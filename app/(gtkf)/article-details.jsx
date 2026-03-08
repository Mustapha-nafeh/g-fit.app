import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useGetArticleBySlug } from "../../api/gtkfApi";
import { showToast } from "../../constants";

export default function ArticlePage() {
  const { slug: articleSlug } = useLocalSearchParams();

  // API hook for fetching article details
  const { data, isLoading, isError, error } = useGetArticleBySlug(articleSlug);
  const article = data?.data;

  // Handle sharing the article
  const handleShare = async () => {
    if (!article) {
      Alert.alert("Error", "Article not found");
      return;
    }

    try {
      const shareMessage = `📖 Check out this amazing article: ${article.title}!

⭐ Rating: ${article.rating} (${article.reviewCount}K reviews)
🏷️ Category: ${article.category}

${article.content.substring(0, 150)}...

#GTKF #KidsHealth #Fitness`;

      const result = await Share.share({
        message: shareMessage,
        title: `${article.title} - GTKF Kids Article`,
      });

      if (result.action === Share.sharedAction) {
        console.log("Article shared successfully");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share article. Please try again.");
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

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background text-white">
      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <View className="w-16 h-16 bg-gray-700 rounded-full items-center justify-center mb-4">
            <Ionicons name="refresh" size={24} color="white" />
          </View>
          <Text className="text-white text-lg font-semibold mb-2">Loading Article...</Text>
          <Text className="text-gray-400 text-sm">Please wait while we fetch the details</Text>
        </View>
      )}

      {/* Error State */}
      {isError && (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
          </View>
          <Text className="text-white text-xl font-bold mb-2 text-center">Failed to Load Article</Text>
          <Text className="text-gray-400 text-sm text-center mb-6 leading-5">
            {error?.response?.data?.message || "Something went wrong while loading the article. Please try again."}
          </Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-gray-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content - Only show when not loading and no error */}
      {!isLoading && !isError && article && (
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-4">
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity onPress={handleBack} className="mt-0.5">
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-2xl font-medium">
                Article Details
              </Text>
            </View>
            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Main Article Image */}
          <View className="mb-4 bg-gray-300 h-80 items-center justify-center">
            <Text className="text-gray-500 text-lg font-medium">Gym Training Image</Text>
            <Text className="text-gray-400 text-sm mt-2">Battle ropes & Treadmills</Text>
          </View>

          {/* Article Content Section - Same Background */}
          <View className="flex-1 pt-6">
            {/* Article Header */}
            <View className="px-6 mb-4">
              <View className="flex-row justify-between items-start mb-3">
                <Text
                  style={{ fontFamily: "MontserratAlternates_700Bold" }}
                  className="text-white text-2xl font-bold flex-1"
                >
                  {article?.title || "Article Title"}
                </Text>
                <TouchableOpacity
                  onPress={handleShare}
                  className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center ml-4"
                >
                  <Ionicons name="share-outline" size={20} color="gray" />
                </TouchableOpacity>
              </View>

              {/* Rating */}
              {/* <View className="flex-row items-center mb-6">
                <Ionicons name="star" size={16} color="#EAB308" />
                <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white ml-1 font-medium">
                  {article?.rating || "4.9"} ({article?.reviewCount || "1"}K reviews)
                </Text>
              </View> */}
            </View>

            {/* Article Text */}
            <View className="px-6 mb-8">
              <Text className="text-white text-base leading-6 mb-4">
                {article?.content ||
                  `Stretching is a physical activity that involves deliberately elongating muscles and tendons to improve
              flexibility, enhance range of motion, and promote overall physical health. It is commonly performed as
              part of a warm-up routine before engaging in more intense exercise or as a standalone activity to maintain and improve flexibility.`}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
