import React, { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const APP_OPTIONS = [
  {
    id: "gfit",
    title: "G-Fit",
    subtitle: "Family steps competitions, leaderboards, and XP challenges.",
    image: require("../../assets/G-FIT-3.png"),
    tag: null,
  },
  {
    id: "gtkf",
    title: "Kids Kit",
    subtitle: "Fitness and wellness programs built for kids.",
    image: require("../../assets/getthekidsfit.png"),
    tag: null,
  },
];

// ─── App option card ───────────────────────────────────────────────────────────

const AppCard = ({ app, selected, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(app.id)}
    activeOpacity={0.8}
    style={{
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      borderRadius: 20,
      marginBottom: 14,
      backgroundColor: selected ? "rgba(214,235,235,0.07)" : "#3A2D6E",
      borderWidth: 1.5,
      borderColor: selected ? "#D6EBEB" : "rgba(255,255,255,0.06)",
    }}
  >
    {/* Image thumbnail */}
    <View
      style={{
        width: 72,
        height: 72,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 18,
        overflow: "hidden",
      }}
    >
      <Image source={app.image} style={{ width: 56, height: 56, resizeMode: "contain" }} />
    </View>

    {/* Text */}
    <View style={{ flex: 1 }}>
      {app.tag && (
        <View
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 10,
            paddingVertical: 3,
            backgroundColor: "rgba(246,243,186,0.15)",
            borderRadius: 10,
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontFamily: "MontserratAlternates_600SemiBold",
              fontSize: 10,
              color: "#F6F3BA",
              letterSpacing: 0.4,
            }}
          >
            {app.tag.toUpperCase()}
          </Text>
        </View>
      )}
      <Text
        style={{
          fontFamily: "MontserratAlternates_700Bold",
          fontSize: 18,
          color: "#FFFFFF",
          marginBottom: 4,
        }}
      >
        {app.title}
      </Text>
      <Text
        style={{
          fontFamily: "MontserratAlternates_400Regular",
          fontSize: 13,
          color: "#A0A0A0",
          lineHeight: 19,
        }}
      >
        {app.subtitle}
      </Text>
    </View>

    {/* Selection indicator */}
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: selected ? "#D6EBEB" : "transparent",
        borderWidth: 1.5,
        borderColor: selected ? "#D6EBEB" : "#494358",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 14,
      }}
    >
      {selected && <Ionicons name="checkmark" size={14} color="#262135" />}
    </View>
  </TouchableOpacity>
);

// ─── Main screen ───────────────────────────────────────────────────────────────

const AppSelectionScreen = () => {
  const [selectedApp, setSelectedApp] = useState(null);

  const handleAppSelect = (appId) => {
    setSelectedApp(appId);
  };

  const handleGetStarted = () => {
    if (!selectedApp) return;
    router.push({ pathname: "(selection)/select-user", params: { selectedApp } });
  };

  // Guest mode — logic preserved, re-enable the button below if needed
  const handleVisitAsGuest = () => {
    if (!selectedApp) return;
    const routes = { gfit: "/(gfit)/home", gtkf: "/(gtkf)/workouts", adults: "/(adults)/home" };
    router.replace(routes[selectedApp] ?? "/(gfit)/home");
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#262135", paddingHorizontal: 24 }}>
        {/* Background decoration */}
        <Image source={require("../../assets/Ellipse1.png")} style={{ position: "absolute", top: 0, left: 0 }} />

        {/* Header */}
        <View style={{ paddingTop: 80, marginBottom: 40 }}>
          <Text
            style={{
              fontFamily: "MontserratAlternates_400Regular",
              fontSize: 14,
              color: "#A0A0A0",
              marginBottom: 10,
              letterSpacing: 0.3,
            }}
          >
            Step 1 of 2
          </Text>
          <Text
            style={{
              fontFamily: "MontserratAlternates_700Bold",
              fontSize: 32,
              color: "#FFFFFF",
              lineHeight: 42,
            }}
          >
            Choose your{"\n"}experience.
          </Text>
        </View>

        {/* App cards */}
        <View style={{ flex: 1 }}>
          {APP_OPTIONS.map((app) => (
            <AppCard key={app.id} app={app} selected={selectedApp === app.id} onPress={handleAppSelect} />
          ))}
        </View>

        {/* CTA */}
        <View style={{ paddingBottom: 52, gap: 12 }}>
          <TouchableOpacity
            onPress={handleGetStarted}
            disabled={!selectedApp}
            activeOpacity={0.85}
            style={{
              width: "100%",
              backgroundColor: selectedApp ? "#D6EBEB" : "#494358",
              paddingVertical: 17,
              borderRadius: 28,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "MontserratAlternates_700Bold",
                fontSize: 17,
                color: selectedApp ? "#262135" : "#6B7280",
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default AppSelectionScreen;
