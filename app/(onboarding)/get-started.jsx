import React from "react";
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import ProgressDots from "../../components/onboarding/ProgressDots";

// Standalone get-started screen — used when navigated to directly.
// All onboarding logic now lives in index.jsx; this screen remains
// a valid route and mirrors the final step's design.

const GetStartedScreen = () => {
  const handleGetStarted = async () => {
    const accessToken = await SecureStore.getItemAsync("access_token");
    router.push(accessToken ? "/(selection)/subscribe" : "/(auth)/welcome");
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#262135" }}>
        {/* Background decoration */}
        <Image
          source={require("../../assets/Ellipse1.png")}
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        {/* Back button */}
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={{
            position: "absolute",
            top: 56,
            left: 24,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#494358",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>

        {/* Content */}
        <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: "flex-end", paddingBottom: 16 }}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-start" }}>
            {/* Badge */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: "rgba(214,235,235,0.12)",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(214,235,235,0.25)",
                marginBottom: 32,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontFamily: "MontserratAlternates_600SemiBold",
                  fontSize: 13,
                  color: "#D6EBEB",
                  letterSpacing: 0.5,
                }}
              >
                YOU'RE ALL SET
              </Text>
            </View>

            <Text
              style={{
                fontFamily: "MontserratAlternates_700Bold",
                fontSize: 40,
                color: "#FFFFFF",
                lineHeight: 50,
                marginBottom: 20,
              }}
            >
              Ready to{"\n"}make it count?
            </Text>

            <Text
              style={{
                fontFamily: "MontserratAlternates_400Regular",
                fontSize: 16,
                color: "#A0A0A0",
                lineHeight: 26,
                maxWidth: 280,
              }}
            >
              Join your family's fitness challenge. Your first step starts now.
            </Text>
          </View>

          {/* Progress indicator */}
          <View style={{ marginBottom: 28 }}>
            <ProgressDots total={4} current={3} />
          </View>

          {/* CTAs */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleGetStarted}
              activeOpacity={0.85}
              style={{
                width: "100%",
                backgroundColor: "#D6EBEB",
                paddingVertical: 17,
                borderRadius: 28,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "MontserratAlternates_700Bold",
                  fontSize: 17,
                  color: "#262135",
                }}
              >
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.7}
              style={{ alignItems: "center", paddingVertical: 12 }}
            >
              <Text
                style={{
                  fontFamily: "MontserratAlternates_400Regular",
                  fontSize: 15,
                  color: "#A0A0A0",
                }}
              >
                Already have an account?{" "}
                <Text style={{ color: "#D6EBEB", fontFamily: "MontserratAlternates_600SemiBold" }}>
                  Log in
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

export default GetStartedScreen;
