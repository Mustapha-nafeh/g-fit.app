import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { showToast } from "../../constants";
import { useLogin } from "../../api/authApi";
import * as securestore from "expo-secure-store";
import { useGlobalContext } from "../../context/GlobalContext";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useLogin();
  const { setIsSubscribed, setMember } = useGlobalContext();

  // Clear any stale auth state when landing on login
  useEffect(() => {
    setIsSubscribed(false);
    setMember(null);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleLogin = (email, password) => {
    setIsLoading(true);
    mutate(
      { email, password },
      {
        onSuccess: (data) => {
          showToast("success", "Login Successful", "You have logged in successfully!");
          securestore.setItemAsync("access_token", data.data.access_token);
          // Sync context from response — source of truth is the login response
          setIsSubscribed(!!data.data.is_subscribed);
          if (data.data.is_subscribed) {
            router.replace("/(selection)/select-app");
          } else {
            router.replace("/(selection)/subscribe");
          }
        },
        onError: (error) => {
          setIsLoading(false);
          if (error.response?.data?.message === "Account is not verified") {
            showToast("error", "Account is not Verified", "an OTP code has been sent to your email");
            router.replace("(auth)/otp");
            securestore.setItemAsync("token_key", error.response?.data?.data.token_key);
          } else {
            showToast("error", "Login Failed", error.response?.data?.message || "An error occurred");
          }
        },
      }
    );
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/password");
  };

  const handleRegisterNow = () => {
    router.replace("/(auth)/register");
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-12">
            <Image source={require("../../assets/Ellipse1.png")} className=" absolute top-0 left-0" />

            {/* Header with Back Button */}
            {/* <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={handleBack}
                className="w-12 h-12 rounded-2xl border border-gray-400 justify-center items-center"
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
            </View> */}

            {/* Content Container */}
            <View className="flex-1 justify-center min-h-[500px]">
              {/* Logo */}
              <View className="items-center mb-8">
                <Image
                  source={require("../../assets/G-FIT-white.png")}
                  style={{ width: 80, height: 80, resizeMode: "contain" }}
                />
              </View>

              {/* Welcome Text */}
              <View className="mb-12">
                <Text
                  style={{ fontFamily: "MontserratAlternates_700Bold" }}
                  className="text-white text-3xl text-left mb-2"
                >
                  Welcome back! Glad
                </Text>
                <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-3xl text-left">
                  to see you, Again!
                </Text>
              </View>

              {/* Input Fields */}
              <View className="mb-6">
                {/* Email Input */}
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
                    marginBottom: 16,
                    fontSize: 16,
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType="emailAddress"
                  autoComplete="email"
                  multiline={false}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                />

                {/* Password Input */}
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    style={{ fontFamily: "MontserratAlternates_400Regular" }}
                    className="w-full bg-gray-700/50 text-white pb-2 h-14 px-6 pr-12 rounded-2xl text-base"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="password"
                    autoComplete="password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-4">
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity onPress={handleForgotPassword} className="self-end mb-8">
                <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-white text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={() => handleLogin(email, password)}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-2xl mb-8 flex-row items-center justify-center ${
                  isLoading ? "bg-gray-400" : "bg-gray-200 active:bg-white"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#1f2937" />
                ) : (
                  <Text
                    style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                    className="text-gray-800 text-center text-lg"
                  >
                    Login
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Register Link */}
            <View className="pb-8">
              <TouchableOpacity onPress={handleRegisterNow} className="active:opacity-70">
                <Text
                  style={{ fontFamily: "MontserratAlternates_400Regular" }}
                  className="text-white text-center text-base"
                >
                  Don't have an account?{" "}
                  <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-yellow-300">
                    Register Now
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

export default LoginScreen;
