import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useStoreNotificationToken } from "../api/notificationsApi";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications and return the Expo push token
async function registerForPushNotificationsAsync() {
  let token;

  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permissions not granted");
    return null;
  }

  // Get the Expo push token
  const pushToken = await Notifications.getExpoPushTokenAsync({
    projectId: "da662151-4335-4421-8da6-a5de45456725",
  });
  token = pushToken.data;

  // Android requires a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

// Hook to register for push notifications and store the token in the backend
export const useRegisterPushNotifications = () => {
  const { mutate: storeToken } = useStoreNotificationToken();

  const registerAndStoreToken = async (memberTokenKey) => {
    try {
      const token = await registerForPushNotificationsAsync();

      if (token && memberTokenKey) {
        storeToken({
          notification_token: token,
          member_token_key: memberTokenKey,
        });
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  return { registerAndStoreToken };
};

// Hook to listen for incoming notifications
export const useNotificationListeners = () => {
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Listener for when a notification is received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listener for when a user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { notification };
};
