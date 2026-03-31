import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useIAP } from "../../utils/iap"; // adjust path as needed

export default function SubscriptionPage() {
  const { subscription, isSubscribed, loading, subscribe } = useIAP();

  const handleBack = () => {
    router.back();
  };

  if (isSubscribed) {
    router.replace("/(selection)/success");
    return null;
  }

  return (
    <ImageBackground source={require("../../assets/subscribe.png")} className="flex-1" resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView className="flex-1">
        <Image source={require("../../assets/subfade.png")} className="absolute" />

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
              Get Full Access
            </Text>
            <Text
              style={{ fontFamily: "MontserratAlternates_400Regular" }}
              className="text-gray-300 text-center text-base"
            >
              Unlock everything with a single plan
            </Text>
          </View>

          {/* Plan Card */}
          <View className="mb-8 p-6 rounded-2xl border-2 border-buttonPrimary bg-buttonPrimary/20">
            <View className="flex-row justify-between items-center">
              <View>
                <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-buttonPrimary text-lg">
                  {subscription?.title ?? "Premium"}
                </Text>
                <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 text-sm mt-1">
                  {subscription?.description ?? "Full access to all features"}
                </Text>
              </View>
              <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-buttonPrimary text-2xl">
                {subscription?.localizedPrice ?? "—"}
              </Text>
            </View>
          </View>

          {/* Features List */}
          <View className="mb-8">
            <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-lg mb-4">
              What's Included
            </Text>
            <View className="space-y-3">
              {["Access to all fitness challenges", "Access to all workouts", "Expert guidance & tips"].map(
                (feature) => (
                  <View key={feature} className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 ml-3">
                      {feature}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={subscribe}
            disabled={loading || !subscription}
            className={`w-full py-4 px-6 rounded-3xl ${loading || !subscription ? "bg-gray-600" : "bg-buttonPrimary"}`}
          >
            {loading ? (
              <ActivityIndicator color="#1a1a1a" />
            ) : (
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-gray-800 text-center text-lg"
              >
                {subscription ? `Subscribe for ${subscription.localizedPrice}` : "Loading..."}
              </Text>
            )}
          </TouchableOpacity>

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
