import React, { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground, StatusBar, SafeAreaView, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [selectedType, setSelectedType] = useState("individual");
  const [isLoading, setIsLoading] = useState(false);

  // Mock subscription products for development
  const mockProducts = {
    "individual.monthly": { price: "$9.99", title: "Individual Monthly" },
    "individual.yearly": { price: "$99.99", title: "Individual Yearly" },
    "family.monthly": { price: "$14.99", title: "Family Monthly" },
    "family.yearly": { price: "$149.99", title: "Family Yearly" },
  };

  // Get current product details for display
  const getCurrentProduct = () => {
    const key = `${selectedType}.${selectedPlan}`;
    return mockProducts[key] || { price: "$9.99", title: "Subscription" };
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Purchase Successful!", "Your subscription has been activated.", [
        {
          text: "OK",
          onPress: () => router.push("/(selection)/success"),
        },
      ]);
    }, 2000);
  };

  return (
    <ImageBackground source={require("../../assets/subscribe.png")} className="flex-1" resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView className="flex-1">
        <Image source={require("../../assets/subfade.png")} className=" absolute" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          {/* Title */}
          <View className="mt-8 mb-8">
            <Text
              style={{ fontFamily: "MontserratAlternates_700Bold" }}
              className="text-white text-3xl text-center mb-2"
            >
              Choose Your Plan
            </Text>
            <Text
              style={{ fontFamily: "MontserratAlternates_400Regular" }}
              className="text-gray-300 text-center text-base"
            >
              Get full access to all features
            </Text>
          </View>

          {/* Plan Type Selection */}
          <View className="mb-6">
            <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-lg mb-4">
              Plan Type
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => setSelectedType("individual")}
                className={`flex-1 p-4 rounded-2xl border-2 ${
                  selectedType === "individual" ? "border-buttonPrimary bg-buttonPrimary/20" : "border-gray-600"
                }`}
              >
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className={`text-center ${selectedType === "individual" ? "text-buttonPrimary" : "text-white"}`}
                >
                  Individual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedType("family")}
                className={`flex-1 p-4 rounded-2xl border-2 ${
                  selectedType === "family" ? "border-buttonPrimary bg-buttonPrimary/20" : "border-gray-600"
                }`}
              >
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className={`text-center ${selectedType === "family" ? "text-buttonPrimary" : "text-white"}`}
                >
                  Family
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Billing Period Selection */}
          <View className="mb-8">
            <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-lg mb-4">
              Billing Period
            </Text>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => setSelectedPlan("monthly")}
                className={`p-4 rounded-2xl border-2 ${
                  selectedPlan === "monthly" ? "border-buttonPrimary bg-buttonPrimary/20" : "border-gray-600"
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text
                      style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                      className={`${selectedPlan === "monthly" ? "text-buttonPrimary" : "text-white"}`}
                    >
                      Monthly
                    </Text>
                    <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 text-sm">
                      Billed monthly
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: "MontserratAlternates_700Bold" }}
                    className={`${selectedPlan === "monthly" ? "text-buttonPrimary" : "text-white"}`}
                  >
                    {selectedType === "individual" ? "$9.99" : "$14.99"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedPlan("yearly")}
                className={`p-4 rounded-2xl border-2 ${
                  selectedPlan === "yearly" ? "border-buttonPrimary bg-buttonPrimary/20" : "border-gray-600"
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text
                      style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                      className={`${selectedPlan === "yearly" ? "text-buttonPrimary" : "text-white"}`}
                    >
                      Yearly
                    </Text>
                    <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 text-sm">
                      Save 17% - Billed annually
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      style={{ fontFamily: "MontserratAlternates_700Bold" }}
                      className={`${selectedPlan === "yearly" ? "text-buttonPrimary" : "text-white"}`}
                    >
                      {selectedType === "individual" ? "$99.99" : "$149.99"}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {selectedType === "individual" ? "$8.33/mo" : "$12.50/mo"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features List */}
          <View className="mb-8">
            <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-lg mb-4">
              What's Included
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 ml-3">
                  Access to all workouts
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 ml-3">
                  Personalized fitness plans
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 ml-3">
                  Progress tracking
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 ml-3">
                  Expert guidance & tips
                </Text>
              </View>
              {selectedType === "family" && (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 ml-3">
                    Up to 6 family members
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-3xl ${isLoading ? "bg-gray-600" : "bg-buttonPrimary"}`}
          >
            <Text
              style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
              className="text-gray-800 text-center text-lg"
            >
              {isLoading ? "Processing..." : `Continue with ${getCurrentProduct().title}`}
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text
            style={{ fontFamily: "MontserratAlternates_400Regular" }}
            className="text-gray-400 text-center text-xs mt-4"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy. Subscription automatically renews
            unless cancelled.
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
