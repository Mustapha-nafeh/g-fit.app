// In-App Purchase API utilities
import RNIap from "react-native-iap";
import { Platform } from "react-native";

// Product IDs for subscriptions
export const SUBSCRIPTION_SKUS = Platform.select({
  ios: [
    "com.gtkf.individual.monthly",
    "com.gtkf.individual.yearly",
    "com.gtkf.family.monthly",
    "com.gtkf.family.yearly",
  ],
  android: [
    "com.gtkf.individual.monthly",
    "com.gtkf.individual.yearly",
    "com.gtkf.family.monthly",
    "com.gtkf.family.yearly",
  ],
});

// Initialize IAP connection
export const initializeIAP = async () => {
  try {
    const result = await RNIap.initConnection();
    console.log("IAP connection initialized:", result);
    return true;
  } catch (error) {
    console.error("Failed to initialize IAP:", error);
    throw error;
  }
};

// Get available subscriptions
export const getSubscriptions = async () => {
  try {
    const products = await RNIap.getSubscriptions(SUBSCRIPTION_SKUS);
    return products;
  } catch (error) {
    console.error("Failed to get subscriptions:", error);
    throw error;
  }
};

// Request subscription purchase
export const requestSubscription = async (productId) => {
  try {
    const purchase = await RNIap.requestSubscription(productId);
    return purchase;
  } catch (error) {
    console.error("Failed to request subscription:", error);
    throw error;
  }
};

// Verify purchase receipt with your backend
export const verifyPurchase = async (receipt) => {
  try {
    // Replace with your actual backend verification endpoint
    const response = await fetch("https://your-api.com/verify-purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receipt: receipt,
        platform: Platform.OS,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to verify purchase:", error);
    throw error;
  }
};

// End IAP connection
export const endIAPConnection = async () => {
  try {
    await RNIap.endConnection();
  } catch (error) {
    console.error("Failed to end IAP connection:", error);
  }
};
