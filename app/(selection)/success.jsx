import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function PaymentSuccessPage() {
  const handleBack = () => {
    router.back();
  };

  const handleGetStarted = () => {
    // Navigate to main app or home screen
    router.replace("/(selection)/select-user"); // or wherever you want to navigate after successful payment
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#3a3052" />
      <SafeAreaView className="flex-1">
        <Image source={require("../../assets/Ellipse1.png")} className=" absolute top-0 left-0" />

        <View className="flex-1">
          {/* Back Button */}
          <View className="px-6 mt-4">
            <TouchableOpacity
              onPress={handleBack}
              className="w-14 h-14 rounded-2xl border border-white/30 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Success Content */}
          <View className="flex-1 justify-center items-center px-6">
            {/* Success Icon */}
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: "#E5E7EB" }}
            >
              <Ionicons name="checkmark" size={48} color="#3a3052" />
            </View>

            {/* Title */}
            <Text
              style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
              className="text-white text-3xl font-bold text-center mb-6"
            >
              Payment completed!
            </Text>

            {/* Subtitle */}
            <Text
              style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
              className="text-gray-400 text-lg text-center leading-relaxed"
            >
              Your payment has been{"\n"}completed successfully.
            </Text>
            <TouchableOpacity
              onPress={handleGetStarted}
              className="rounded-full mt-6 py-5 w-full items-center bg-buttonPrimary"
            >
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-xl font-semibold text-background"
              >
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
