import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

export default function ArticlePage() {
  const { id: articleId } = useLocalSearchParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    console.log("Article ID:", articleId);
    // Mock article data - replace with actual API call
    setArticle({
      id: articleId,
      title: "Stretching Training",
      content: `Stretching is a physical activity that involves deliberately elongating muscles and tendons to improve flexibility, enhance range of motion, and promote overall physical health. It is commonly performed as part of a warm-up routine before engaging in more intense exercise or as a standalone activity to maintain and improve flexibility.

Regular stretching can help prevent injury, reduce muscle tension, improve posture, and enhance athletic performance. There are various types of stretching, including static stretching, dynamic stretching, and proprioceptive neuromuscular facilitation (PNF) stretching.`,
      rating: 4.9,
      reviewCount: 1000,
      category: "Flexibility",
    });
  }, [articleId]);

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
            <View className="flex-row items-center mb-6">
              <Ionicons name="star" size={16} color="#EAB308" />
              <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white ml-1 font-medium">
                {article?.rating || "4.9"} ({article?.reviewCount || "1"}K reviews)
              </Text>
            </View>
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

          {/* You May Also Like Section */}
          <View className="px-6 pb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-white text-xl font-bold"
              >
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
              {relatedArticles.map((relatedArticle) => (
                <View key={relatedArticle.id} className="mr-2">
                  <View className="w-40 h-40 bg-gray-200 rounded-2xl items-center justify-center relative">
                    <Text className="text-gray-500 text-sm text-center">{relatedArticle.placeholder}</Text>

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
    </SafeAreaView>
  );
}
