import React, { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground, StatusBar, SafeAreaView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [selectedType, setSelectedType] = useState("individual");

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Handle subscription continuation logic
    console.log("Selected plan:", selectedPlan);
    console.log("Selected type:", selectedType);
    // Navigate to next screen or handle payment
    router.push("/(selection)/select-payment");
  };

  return (
    <ImageBackground source={require("../../assets/subscribe.png")} className="flex-1" resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView className="flex-1">
        <Image source={require("../../assets/subfade.png")} className=" absolute" />
        <View className="flex-1 px-6">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm items-center justify-center mt-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Content */}
          <View className="flex h-full justify-end pb-20">
            {/* Title */}
            <View className="mb-8">
              <Text
                style={{ fontFamily: "MontserratAlternates_700Bold" }}
                className="text-white text-5xl font-bold leading-tight"
              >
                Choose your{"\n"}plan
              </Text>
            </View>

            {/* Pricing Options */}
            <View className="space-y-4 mb-8">
              {/* Monthly Plan */}
              <TouchableOpacity
                onPress={() => setSelectedPlan("monthly")}
                className={`rounded-2xl border-2 px-6 py-4 ${
                  selectedPlan === "monthly" ? "border-white bg-white/10" : "border-white/40 bg-white/5"
                }`}
                style={{
                  backgroundColor:
                    selectedPlan === "monthly" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
                }}
              >
                <Text
                  className="text-white text-xl font-semibold"
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                >
                  {selectedType === "many" ? "2$ per month" : "1$ per month"}
                </Text>
              </TouchableOpacity>

              {/* Yearly Plan */}
              <TouchableOpacity
                onPress={() => setSelectedPlan("yearly")}
                className={`rounded-2xl border-2 px-6 py-4 ${
                  selectedPlan === "yearly" ? "border-white bg-white/10" : "border-white/40 bg-white/5"
                }`}
                style={{
                  backgroundColor: selectedPlan === "yearly" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
                }}
              >
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className="text-white text-xl font-semibold"
                >
                  {selectedType === "many" ? "20$ per year" : "10$ per year"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Plan Type Selection */}
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity onPress={() => setSelectedType("individual")} className="flex-row items-center">
                <View
                  className={`w-6 h-6 rounded-full border-2 border-white mr-3 ${
                    selectedType === "individual" ? "bg-white" : "bg-transparent"
                  }`}
                >
                  {selectedType === "individual" && (
                    <View className="flex-1 items-center justify-center">
                      <View className="w-2 h-2 rounded-full bg-black" />
                    </View>
                  )}
                </View>
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className="text-white text-lg font-medium"
                >
                  Individual
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSelectedType("many")} className="flex-row items-center">
                <View
                  className={`w-6 h-6 rounded-full border-2 border-white mr-3 ${
                    selectedType === "many" ? "bg-white" : "bg-transparent"
                  }`}
                >
                  {selectedType === "many" && (
                    <View className="flex-1 items-center justify-center">
                      <View className="w-2 h-2 rounded-full bg-black" />
                    </View>
                  )}
                </View>
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className="text-white text-lg font-medium"
                >
                  Many
                </Text>
              </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-black/30 rounded-2xl py-4 items-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            >
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-white text-xl font-semibold"
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
