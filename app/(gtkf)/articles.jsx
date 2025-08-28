import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useGetArticles } from "../../api/gtkfApi";
import { showToast } from "../../constants";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);

  const { mutate, data, isLoading, isError } = useGetArticles();
  useEffect(() => {
    mutate(
      { type: "kids" },
      {
        onSuccess: (data) => {
          console.log("Articles fetched successfully:", data);
          setArticles(data.data || []);
        },
        onError: (error) => {
          console.error("Error fetching articles:", error);
          showToast("error", "Error", error.response?.data?.message || "An error occurred");
        },
      }
    );
  }, []);

  const ReadMore = (id) => {
    console.log("Read more pressed for article id:", id);
    router.push(`/(gtkf)/article-details?id=${id}`);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar style="light" />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className=" bg-background flex-row justify-between items-center px-6 py-4">
          <View>
            <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-2xl">
              Kids Articles
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Get Kids Fit Banner - Image Placeholder */}
        <View className="mx-6 mb-6 bg-gray-300 rounded-2xl h-48 items-center justify-center">
          <Image source={require("../../assets/getthekidsfit.png")} />
        </View>

        {/* White Background Section */}
        <View className="bg-white flex-1 py-6 pb-24">
          {/* Category Tabs */}
          <ScrollView horizontal className=" px-6 mb-6  space-x-3">
            <TouchableOpacity className="bg-green-200 px-4 py-2 rounded-full">
              <Text className="text-gray-800 font-medium">New articles</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center px-4 py-2">
              <Ionicons name="heart-outline" size={16} color="#9CA3AF" className="mr-1" />
              <Text className="text-gray-400 font-medium ml-1">Cardio</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center px-4 py-2">
              <Ionicons name="body-outline" size={16} color="#9CA3AF" className="mr-1" />
              <Text className="text-gray-400 font-medium ml-1">Flexibility</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Most Popular Section */}
          <View className="px-6 mb-6 flex-grow">
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

            {/* Article Cards */}
            <View className="space-y-4">
              {articles.length === 0 && <Text className="text-gray-400 text-center">No articles available.</Text>}
              {articles.length !== 0 &&
                articles.map((article) => (
                  <View key={article.id} className="bg-white rounded-2xl py-4 flex-row items-center">
                    <View className="w-20 h-20 bg-gray-200 rounded-2xl mr-4 items-center justify-center">
                      <Text className="text-gray-400 text-xs text-center">Image{"\n"}Placeholder</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-black text-lg font-bold mb-1">{article.title}</Text>
                      <Text className="text-black-600 text-sm leading-4">{article.description}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => ReadMore(article.id)}
                      className={`bg-gtkfText px-4 py-3 rounded-full ml-2`}
                    >
                      <Text className={`font-medium text-sm`}>Read more</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
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
