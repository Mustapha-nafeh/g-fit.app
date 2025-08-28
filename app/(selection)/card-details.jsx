import React, { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, TextInput, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

export default function CardDetailsPage() {
  const { selectedMethod } = useLocalSearchParams();
  const [saveCardInfo, setSaveCardInfo] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    holderName: "",
    number: "",
    cvv: "",
    expiredDate: "",
  });
  const [paypalDetails, setPaypalDetails] = useState({
    email: "",
    password: "",
  });

  const handleBack = () => {
    router.back();
  };

  const handleAdd = () => {
    console.log("Selected payment method:", selectedMethod);
    if (selectedMethod === "paypal") {
      console.log("PayPal details:", paypalDetails);
    } else {
      router.push("(selection)/success");
      console.log("Card details:", cardDetails);
      console.log("Save card info:", saveCardInfo);
    }
    // Handle adding payment method
  };

  const updateCardDetail = (field, value) => {
    setCardDetails((prev) => ({ ...prev, [field]: value }));
  };

  const updatePaypalDetail = (field, value) => {
    setPaypalDetails((prev) => ({ ...prev, [field]: value }));
  };

  const renderVisaCard = () => (
    <View className="bg-black rounded-2xl p-6 mx-6 mb-8 h-48">
      <View className="flex-row justify-between items-start mb-8">
        <View />
        <View>
          <Text className="text-white text-2xl font-bold">VISA</Text>
          <Text className="text-white text-sm">DEBIT</Text>
        </View>
      </View>

      <View className="flex-row mb-6">
        <View className="w-12 h-8 bg-gray-400 rounded mr-2" />
        <View className="w-8 h-6 bg-gray-300 rounded" />
      </View>
    </View>
  );

  const renderPayPalCard = () => (
    <View className="bg-blue-600 rounded-2xl p-6 mx-6 mb-8 h-48 justify-center items-center">
      <Text className="text-white text-4xl font-bold mb-2">PayPal</Text>
      <Text className="text-white text-lg opacity-80">Secure Payment</Text>
    </View>
  );

  const renderCardForm = () => (
    <View className="px-6 space-y-4">
      <TextInput
        style={{ fontFamily: "MontserratAlternates_400Regular" }}
        className="bg-gray-700 rounded-2xl px-6 py-4 text-white text-lg"
        placeholder="Holder name"
        placeholderTextColor="#9CA3AF"
        value={cardDetails.holderName}
        onChangeText={(text) => updateCardDetail("holderName", text)}
      />

      <TextInput
        style={{ fontFamily: "MontserratAlternates_400Regular" }}
        className="bg-gray-700 rounded-2xl px-6 py-4 text-white text-lg"
        placeholder="Number"
        placeholderTextColor="#9CA3AF"
        value={cardDetails.number}
        onChangeText={(text) => updateCardDetail("number", text)}
        keyboardType="numeric"
        maxLength={19}
      />

      <View className="flex-row space-x-4">
        <TextInput
          style={{ fontFamily: "MontserratAlternates_400Regular" }}
          className="bg-gray-700 rounded-2xl px-6 py-4 text-white text-lg flex-1"
          placeholder="CVV"
          placeholderTextColor="#9CA3AF"
          value={cardDetails.cvv}
          onChangeText={(text) => updateCardDetail("cvv", text)}
          keyboardType="numeric"
          maxLength={4}
        />

        <TextInput
          style={{ fontFamily: "MontserratAlternates_400Regular" }}
          className="bg-gray-700 rounded-2xl px-6 py-4 text-white text-lg flex-1"
          placeholder="Expired Date"
          placeholderTextColor="#9CA3AF"
          value={cardDetails.expiredDate}
          onChangeText={(text) => updateCardDetail("expiredDate", text)}
          maxLength={5}
        />
      </View>
    </View>
  );

  const renderPayPalForm = () => (
    <View className="px-6 space-y-4">
      <TextInput
        style={{ fontFamily: "MontserratAlternates_400Regular" }}
        className="bg-gray-700 rounded-2xl px-6 py-4 text-white text-lg"
        placeholder="PayPal Email"
        placeholderTextColor="#9CA3AF"
        value={paypalDetails.email}
        onChangeText={(text) => updatePaypalDetail("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={{ fontFamily: "MontserratAlternates_400Regular" }}
        className="bg-gray-700 rounded-2xl px-6 py-4 text-white text-lg"
        placeholder="PayPal Password"
        placeholderTextColor="#9CA3AF"
        value={paypalDetails.password}
        onChangeText={(text) => updatePaypalDetail("password", text)}
        secureTextEntry
      />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#3a3052" />
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* Decorative circles */}
          <View className="absolute top-16 right-8">
            <View
              className="w-20 h-20 rounded-full opacity-20"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            />
            <View
              className="w-8 h-8 rounded-full opacity-30 absolute -bottom-2 -right-2"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            />
          </View>

          <View className="absolute top-48 right-16">
            <View
              className="w-16 h-16 rounded-full opacity-15"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            />
          </View>

          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 rounded-2xl border border-white/30 items-center justify-center mt-4 ml-6 mb-4"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Title */}
          <View className="px-6 mb-8">
            <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-4xl font-bold">
              My {selectedMethod === "paypal" ? "Paypal" : "Card"}
            </Text>
          </View>

          {/* Card/PayPal Display */}
          {selectedMethod === "paypal" ? renderPayPalCard() : renderVisaCard()}

          {/* Form */}
          <View className="flex-1">
            {selectedMethod === "paypal" ? renderPayPalForm() : renderCardForm()}

            {/* Save Card Toggle */}
            <View className="flex-row items-center justify-between px-6 py-6">
              <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-white text-lg">
                Save your {selectedMethod === "paypal" ? "PayPal" : "card"} information
              </Text>
              <Switch
                value={saveCardInfo}
                onValueChange={setSaveCardInfo}
                trackColor={{ false: "#4B5563", true: "#60A5FA" }}
                thumbColor={saveCardInfo ? "#FFFFFF" : "#9CA3AF"}
              />
            </View>
          </View>

          {/* Add Button */}
          <View className="px-6 pb-8">
            <TouchableOpacity
              onPress={handleAdd}
              className="rounded-2xl py-4 items-center border border-white/30"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <Text
                style={{ fontFamily: "MontserratAlternates_400Regular" }}
                className="text-white text-xl font-semibold"
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
