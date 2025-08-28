import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

export default function ArticlePage() {
  const { id: articleId } = useLocalSearchParams();
  useEffect(() => {
    console.log("Article ID:", articleId);
  }, [articleId]);

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
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity onPress={handleBack} className="mt-0.5">
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-2xl font-medium">
              Kids Articles {articleId}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Main Article Image */}
        <View className=" mb-4 bg-gray-300 h-80 items-center justify-center">
          <Text className="text-white text-lg font-medium">Gym Training Image</Text>
          <Text className="text-white text-sm mt-2">Battle ropes & Treadmills</Text>
        </View>

        {/* Article Content Section */}
        <View className="h-full flex-1 pt-6 text-white">
          {/* Article Header */}
          <View className="px-6 mb-4">
            <View className="flex-row justify-between items-start mb-3">
              <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-2xl font-bold">
                Stretching Training
              </Text>
              <View className="flex-row space-x-2 ml-4">
                <TouchableOpacity className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center">
                  <Ionicons name="share-outline" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Rating */}
            <View className="flex-row items-center mb-6">
              <Ionicons name="star" size={16} color="#EAB308" />
              <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white ml-1 font-medium">
                4,9 (1K review)
              </Text>
            </View>
          </View>

          {/* Article Text */}
          <View className="px-6 mb-8">
            <Text className="text-white text-base leading-6 mb-4">
              Stretching is a physical activity that involves deliberately elongating muscles and tendons to improve
              flexibility, enhance range of motion, and promote overall physical health. It is commonly performed as
              part of a warm-up routine before engaging in more intense exercise or...
            </Text>
            <Text className="text-white text-base leading-6">
              Stretching is a physical activity that involves deliberately elongating muscles and tendons to improve
              flexibility, enhance range of motion, and promote overall physical health. It is commonly performed as
              part of a warm-up routine before engaging in more intense exercise or...
            </Text>
          </View>

          {/* You May Also Like Section */}
          <View className="px-6 pb-24 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-xl font-bold">
                You may also like
              </Text>
              <TouchableOpacity>
                <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white font-medium">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {/* Related Articles */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
              {relatedArticles.map((article) => (
                <View key={article.id} className="mr-2">
                  <View className="w-40 h-40 bg-gray-200 rounded-2xl items-center justify-center relative">
                    <Text className="text-white text-sm text-center">{article.placeholder}</Text>

                    {/* Heart Icon */}
                    <TouchableOpacity className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full items-center justify-center">
                      <Ionicons name="heart-outline" size={16} color="gray" />
                    </TouchableOpacity>

                    {/* Arrow Icon */}
                    <TouchableOpacity className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full items-center justify-center">
                      <Ionicons name="arrow-forward" size={16} color="gray" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
      {/* Bottom Button */}
      <TouchableOpacity className="bg-cyan-400 py-4 rounded-2xl items-center absolute bottom-6 left-6 right-6 shadow-2xl shadow-black">
        <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-gray-800 text-lg font-bold">
          Let's Workout
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
