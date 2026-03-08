import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useGetArticles } from "../../api/gtkfApi";
import { showToast } from "../../constants";
import useFilterData from "../../hooks/useFilter";
import GtkfHeader from "../../global-components/GtkfHeader";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Filter hook
  const { filterFields, setFilterFields, filteredData } = useFilterData(articles, {});

  const { data, isLoading, isError, error, refetch } = useGetArticles("kids");

  // Update articles when data is fetched
  useEffect(() => {
    if (data?.data) {
      console.log("Articles fetched successfully:", data);
      setArticles(data.data);
    }
  }, [data]);

  // Show error toast when there's an error
  useEffect(() => {
    if (isError && error) {
      console.error("Error fetching articles:", error);
      showToast("error", "Error", error.response?.data?.message || "Failed to load articles");
    }
  }, [isError, error]);

  // Article categories for filtering
  const articleCategories = [
    { id: "all", name: "All Articles", icon: null },
    { id: "cardio", name: "Cardio", icon: "heart-outline" },
    { id: "flexibility", name: "Flexibility", icon: "body-outline" },
    { id: "strength", name: "Strength", icon: "fitness-outline" },
    { id: "nutrition", name: "Nutrition", icon: "nutrition-outline" },
  ];

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category.id);
    if (category.id === "all") {
      setFilterFields({});
    } else {
      setFilterFields("category", category.id);
    }
  };

  const ReadMore = (slug) => {
    console.log("Read more pressed for article slug:", slug);
    router.push(`/(gtkf)/article-details?slug=${slug}`);
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      showToast("success", "Success", "Articles refreshed successfully");
    } catch (error) {
      console.error("Error refreshing articles:", error);
      showToast("error", "Error", "Failed to refresh articles");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar style="light" />
      <View className="flex-1">
        {/* Header with Navigation */}
        <GtkfHeader title="Kids Articles" currentTab="articles" />

        {/* Get Kids Fit Banner - Image Placeholder */}
        <View className="mx-6 mb-6 bg-gray-300 rounded-2xl h-48 items-center justify-center">
          <Image source={require("../../assets/getthekidsfit.png")} />
        </View>

        {/* White Background Section - Full Height */}
        <View className="bg-white flex-1 py-6">
          {/* Category Filter Tabs */}
          <ScrollView horizontal className="px-6 mb-6 max-h-12" showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {articleCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategorySelect(category)}
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

          {/* Articles List */}
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Loading State */}
            {isLoading && (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-gray-400 text-center">Loading articles...</Text>
              </View>
            )}

            {/* Error State */}
            {isError && (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                <Text className="text-red-500 text-center mt-2">Failed to load articles</Text>
                <Text className="text-gray-400 text-center mt-1">Please try again later</Text>
              </View>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredData?.length === 0 && (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-400 text-center mt-2">
                  {selectedCategory === "all" ? "No articles available" : `No articles found in ${selectedCategory}`}
                </Text>
              </View>
            )}

            {/* Articles Content */}
            {!isLoading && !isError && filteredData?.length > 0 && (
              <View>
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                    className="text-gtkfText text-2xl font-bold"
                  >
                    {selectedCategory === "all"
                      ? "Most Popular"
                      : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Articles`}
                  </Text>
                  <TouchableOpacity>
                    <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-gray-400">
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Article Cards */}
                <View className="space-y-4 pb-6">
                  {filteredData.map((article) => (
                    <View key={article.slug || article.id} className="bg-white rounded-2xl py-4 flex-row items-center">
                      <View className="w-20 h-20 bg-gray-200 rounded-2xl mr-4 items-center justify-center">
                        <Text className="text-gray-400 text-xs text-center">Image{"\n"}Placeholder</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-black text-lg font-bold mb-1">{article.title}</Text>
                        <Text className="text-black-600 text-sm leading-4" numberOfLines={2}>
                          {article.description}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => ReadMore(article.slug || article.id)}
                        className="bg-gtkfText px-4 py-3 rounded-full ml-2"
                      >
                        <Text className="font-medium text-sm">Read more</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
