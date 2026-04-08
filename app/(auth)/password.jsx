import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { showToast } from "../../constants";
import { useForgotPassword } from "../../api/authApi";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const { mutate: forgotPassword, isLoading } = useForgotPassword();

  const handleBack = () => {
    router.back();
  };

  const handleSendResetLink = () => {
    if (!email) {
      showToast("error", "Email Required", "Please enter your email address");
      return;
    }

    forgotPassword(
      { email },
      {
        onSuccess: (data) => {
          showToast("success", "Reset Link Sent", "Password reset link has been sent to your email");
          router.back(); // Go back to login screen
        },
        onError: (error) => {
          showToast(
            "error",
            "Failed to Send",
            error.response?.data?.message || "Could not send reset link. Please try again."
          );
        },
      }
    );
  };

  const handleBackToLogin = () => {
    router.replace("/(auth)/login");
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-12">
            <Image source={require("../../assets/Ellipse1.png")} className=" absolute top-0 left-0" />

            {/* Header with Back Button */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={handleBack}
                className="w-12 h-12 rounded-2xl border border-gray-400 justify-center items-center"
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Content Container */}
            <View className="flex-1 justify-center min-h-[500px]">
              {/* Logo */}
              <View className="items-center mb-8">
                <Image
                  source={require("../../assets/G-FIT-white.png")}
                  style={{ width: 80, height: 80, resizeMode: "contain" }}
                />
              </View>

              {/* Title and Description */}
              <View className="mb-12">
                <Text
                  style={{ fontFamily: "MontserratAlternates_700Bold" }}
                  className="text-white text-3xl text-left mb-4"
                >
                  Forgot Password?
                </Text>
                <Text
                  style={{ fontFamily: "MontserratAlternates_400Regular" }}
                  className="text-gray-300 text-base text-left leading-6"
                >
                  Don't worry! It occurs. Please enter the email address linked with your account.
                </Text>
              </View>

              {/* Email Input */}
              <View className="mb-8">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    fontFamily: "MontserratAlternates_400Regular",
                    width: "100%",
                    backgroundColor: "rgba(55,65,81,0.5)",
                    color: "#fff",
                    height: 56,
                    paddingHorizontal: 24,
                    borderRadius: 16,
                    fontSize: 16,
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  multiline={false}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                />
              </View>

              {/* Send Reset Link Button */}
              <TouchableOpacity
                onPress={handleSendResetLink}
                className={`w-full py-4 px-6 rounded-2xl mb-8 ${
                  isLoading || !email ? "bg-gray-400" : "bg-gray-200 active:bg-white"
                }`}
                disabled={isLoading || !email}
              >
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className="text-gray-800 text-center text-lg"
                >
                  {isLoading ? "Sending..." : "Send Code"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Login Link */}
            <View className="pb-8">
              <TouchableOpacity onPress={handleBackToLogin} className="active:opacity-70">
                <Text
                  style={{ fontFamily: "MontserratAlternates_400Regular" }}
                  className="text-white text-center text-base"
                >
                  Remember Password?{" "}
                  <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-yellow-300">
                    Login
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default ForgotPasswordScreen;
