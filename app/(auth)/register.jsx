import React, { useState } from "react";
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
import { useRegister } from "../../api/authApi";
import { showToast } from "../../constants";
import * as securestore from "expo-secure-store";

const RegisterScreen = () => {
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate } = useRegister();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (newPassword, newConfirm) => {
    if (newConfirm === "") {
      setError("");
    } else if (newPassword !== newConfirm) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  };

  const handleRegister = (familyName, email, password) => {
    setIsLoading(true);
    mutate(
      { family_name: familyName, email, password },
      {
        onSuccess: (data) => {
          showToast("success", "Registration Successful", "You have registered successfully!");
          const tokenKey = data.data.token_key;
          securestore.setItemAsync("token_key", tokenKey);
          router.replace("/(auth)/otp");
        },
        onError: (error) => {
          setIsLoading(false);
          showToast("error", "Registration Failed", error.response?.data?.message || "An error occurred");
        },
      }
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleLoginNow = () => {
    router.replace("/(auth)/login");
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
            <View className="flex-1 justify-center min-h-[600px]">
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
                  Hello! Register to get
                </Text>
                <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-3xl text-left">
                  started
                </Text>
              </View>

              {/* Input Fields */}
              <View className="mb-8">
                {/* Family Name Input */}
                <TextInput
                  value={familyName}
                  onChangeText={setFamilyName}
                  placeholder="Family Name"
                  placeholderTextColor="#9CA3AF"
                  style={{ fontFamily: "MontserratAlternates_400Regular" }}
                  className="w-full bg-gray-700/50 text-white pb-2 h-14 px-6 rounded-2xl mb-4 text-base"
                  autoCapitalize="words"
                  autoCorrect={false}
                  textContentType="familyName"
                />

                {/* Email Input */}
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
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
                <View className="relative mb-4">
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      validatePassword(text, confirmPassword);
                    }}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    style={{ fontFamily: "MontserratAlternates_400Regular" }}
                    className="w-full bg-gray-700/50 text-white pb-2 h-14 px-6 pr-12 rounded-2xl text-base"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="newPassword"
                    autoComplete="password-new"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-4">
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      validatePassword(password, text);
                    }}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    style={{ fontFamily: "MontserratAlternates_400Regular" }}
                    className="w-full bg-gray-700/50 text-white pb-2 h-14 px-6 pr-12 rounded-2xl text-base"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="newPassword"
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4"
                  >
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                {error ? <Text className="text-red-500 mt-2 text-center">{error}</Text> : null}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={() => handleRegister(familyName, email, password)}
                className={`w-full py-4 px-6 rounded-2xl mb-8 flex-row items-center justify-center ${
                  isLoading || error !== "" || confirmPassword === "" || familyName === ""
                    ? "bg-gray-400"
                    : "bg-gray-200 active:bg-white"
                }`}
                disabled={isLoading || error !== "" || confirmPassword === "" || familyName === ""}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#1f2937" />
                ) : (
                  <Text
                    style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                    className="text-gray-800 text-center text-lg"
                  >
                    Register
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Login Link */}
            <View className="pb-8">
              <TouchableOpacity onPress={handleLoginNow} className="active:opacity-70">
                <Text
                  style={{ fontFamily: "MontserratAlternates_400Regular" }}
                  className="text-white text-center text-base"
                >
                  Already have an account?{" "}
                  <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-yellow-300">
                    Login Now
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

export default RegisterScreen;
