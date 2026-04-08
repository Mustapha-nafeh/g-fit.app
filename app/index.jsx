import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useGlobalContext } from "../context/GlobalContext";
import ProgressDots from "../components/onboarding/ProgressDots";

// ─── Slide definitions ────────────────────────────────────────────────────────

const SLIDES = [
  {
    image: require("../assets/G-FIT-white.png"),
    headline: "Move Together.\nWin Together.",
    body: "The family fitness challenge app that makes staying active — and competitive — actually fun.",
  },
  {
    icon: "walk",
    iconColor: "#F6F3BA",
    iconBg: "rgba(246,243,186,0.10)",
    headline: "Every Step\nCounts.",
    body: "Your daily steps are tracked automatically. See how you stack up against your family in real time.",
  },
  {
    icon: "trophy",
    iconColor: "#D6EBEB",
    iconBg: "rgba(214,235,235,0.12)",
    headline: "Earn XP.\nRise Up.",
    body: "Complete weekly challenges, earn experience points, and climb the family leaderboard.",
  },
];

const TOTAL_STEPS = SLIDES.length + 1; // last step is the Get Started CTA

// ─── Feature slide ─────────────────────────────────────────────────────────────

const FeatureSlide = ({ slide }) => (
  <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: "center", paddingTop: 60 }}>
    {/* Icon bubble or image */}
    {slide.image ? (
      <Image source={slide.image} style={{ width: 160, height: 160, resizeMode: "contain", marginBottom: 44 }} />
    ) : (
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: slide.iconBg,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 44,
        }}
      >
        <Ionicons name={slide.icon} size={42} color={slide.iconColor} />
      </View>
    )}

    <Text
      style={{
        fontFamily: "MontserratAlternates_700Bold",
        fontSize: 40,
        color: "#FFFFFF",
        lineHeight: 50,
        marginBottom: 20,
      }}
    >
      {slide.headline}
    </Text>

    <Text
      style={{
        fontFamily: "MontserratAlternates_400Regular",
        fontSize: 16,
        color: "#A0A0A0",
        lineHeight: 26,
        maxWidth: 290,
      }}
    >
      {slide.body}
    </Text>
  </View>
);

// ─── Get Started slide ─────────────────────────────────────────────────────────

const GetStartedSlide = ({ onGetStarted, onLogin }) => (
  <View
    style={{
      flex: 1,
      paddingHorizontal: 28,
      justifyContent: "flex-end",
      paddingBottom: 16,
    }}
  >
    {/* Visual */}
    <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-start" }}>
      {/* Glowing badge */}
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

    {/* CTAs */}
    <View style={{ gap: 12 }}>
      <TouchableOpacity
        onPress={onGetStarted}
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

      <TouchableOpacity onPress={onLogin} activeOpacity={0.7} style={{ alignItems: "center", paddingVertical: 12 }}>
        <Text
          style={{
            fontFamily: "MontserratAlternates_400Regular",
            fontSize: 15,
            color: "#A0A0A0",
          }}
        >
          Already have an account?{" "}
          <Text style={{ color: "#D6EBEB", fontFamily: "MontserratAlternates_600SemiBold" }}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { fetchProfile } = useGlobalContext();
  const [step, setStep] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
    checkStoredData();
  }, []);

  const checkStoredData = async () => {
    try {
      const access_token = await SecureStore.getItemAsync("access_token");
      if (access_token) {
        router.replace("/(selection)/select-app");
      }
    } catch (_) {}
  };

  const animateToStep = (nextStep) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -18, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      translateY.setValue(22);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) animateToStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) animateToStep(step - 1);
  };

  const handleGetStarted = async () => {
    const accessToken = await SecureStore.getItemAsync("access_token");
    router.push(accessToken ? "/(selection)/subscribe" : "/(auth)/welcome");
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#262135" }}>
        {/* Background decoration */}
        <Image source={require("../assets/Ellipse1.png")} style={{ position: "absolute", top: 0, left: 0 }} />

        {/* Animated slide content */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY }] }}>
          {isLastStep ? (
            <GetStartedSlide onGetStarted={handleGetStarted} onLogin={handleLogin} />
          ) : (
            <FeatureSlide slide={SLIDES[step]} />
          )}
        </Animated.View>

        {/* Bottom nav bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 28,
            paddingBottom: 52,
          }}
        >
          <ProgressDots total={TOTAL_STEPS} current={step} />

          {!isLastStep && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {step > 0 && (
                <TouchableOpacity
                  onPress={handleBack}
                  activeOpacity={0.7}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#494358",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.85}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#D6EBEB",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="chevron-forward" size={22} color="#262135" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </>
  );
}
