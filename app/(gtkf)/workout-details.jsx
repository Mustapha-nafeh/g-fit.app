import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutPage() {
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
    <SafeAreaView className="flex-1 bg-slate-800">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <View>
            <Text className="text-white text-lg font-medium">Many of</Text>
            <Text className="text-white text-xl font-bold">The best adults articles</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Main Article Image */}
        <View className="mx-6 mb-4 bg-gray-300 rounded-2xl h-80 items-center justify-center">
          <Text className="text-gray-500 text-lg font-medium">Gym Training Image</Text>
          <Text className="text-gray-400 text-sm mt-2">Battle ropes & Treadmills</Text>
        </View>

        {/* Article Content Section */}
        <View className="bg-white flex-1 rounded-t-3xl pt-6">
          {/* Article Header */}
          <View className="px-6 mb-4">
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-gray-900 text-2xl font-bold flex-1">Stretching Training</Text>
              <View className="flex-row space-x-2 ml-4">
                <TouchableOpacity className="w-10 h-10 bg-pink-500 rounded-full items-center justify-center">
                  <Ionicons name="heart" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center">
                  <Ionicons name="share-outline" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Rating */}
            <View className="flex-row items-center mb-6">
              <Ionicons name="star" size={16} color="#EAB308" />
              <Text className="text-gray-600 ml-1 font-medium">4,9 (1K review)</Text>
            </View>
          </View>

          {/* Article Text */}
          <View className="px-6 mb-8">
            <Text className="text-gray-600 text-base leading-6 mb-4">
              Stretching is a physical activity that involves deliberately elongating muscles and tendons to improve
              flexibility, enhance range of motion, and promote overall physical health. It is commonly performed as
              part of a warm-up routine before engaging in more intense exercise or...
            </Text>
            <Text className="text-gray-600 text-base leading-6">
              Stretching is a physical activity that involves deliberately elongating muscles and tendons to improve
              flexibility, enhance range of motion, and promote overall physical health. It is commonly performed as
              part of a warm-up routine before engaging in more intense exercise or...
            </Text>
          </View>

          {/* You May Also Like Section */}
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 text-xl font-bold">You may also like</Text>
              <TouchableOpacity>
                <Text className="text-gray-400 font-medium">See All</Text>
              </TouchableOpacity>
            </View>

            {/* Related Articles */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
              {relatedArticles.map((article) => (
                <View key={article.id} className="mr-4">
                  <View className="w-40 h-32 bg-gray-200 rounded-2xl items-center justify-center relative">
                    <Text className="text-gray-500 text-sm text-center">{article.placeholder}</Text>

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
      <View className="bg-white px-6 pb-6 pt-4">
        <TouchableOpacity className="bg-cyan-400 py-4 rounded-2xl items-center">
          <Text className="text-gray-700 text-lg font-bold">Lets workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
