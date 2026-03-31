import { Platform } from "react-native";

export const SUBSCRIPTION_ID = "com.gfit.monthly";

export const PRODUCT_IDS = Platform.select({
  ios: [SUBSCRIPTION_ID],
  android: [SUBSCRIPTION_ID],
});
