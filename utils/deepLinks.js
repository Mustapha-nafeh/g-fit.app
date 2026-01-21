// Deep linking utilities for the GTKF app
import { Linking } from "react-native";

// Base URL configurations
export const APP_SCHEME = "gtkf";
export const WEB_BASE_URL = "https://gtkf.app";

/**
 * Generate a deep link URL for the app
 * @param {string} path - The app route path (e.g., 'workout-details')
 * @param {Object} params - Query parameters
 * @returns {string} - The complete deep link URL
 */
export const generateDeepLink = (path, params = {}) => {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&");

  return `${APP_SCHEME}://${path}${queryString ? `?${queryString}` : ""}`;
};

/**
 * Generate a web fallback URL
 * @param {string} path - The web route path
 * @param {Object} params - Query parameters
 * @returns {string} - The complete web URL
 */
export const generateWebLink = (path, params = {}) => {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&");

  return `${WEB_BASE_URL}/${path}${queryString ? `?${queryString}` : ""}`;
};

/**
 * Open a deep link in the app or fallback to web
 * @param {string} path - The app route path
 * @param {Object} params - Query parameters
 */
export const openDeepLink = async (path, params = {}) => {
  const deepLink = generateDeepLink(path, params);
  const webLink = generateWebLink(path, params);

  try {
    const supported = await Linking.canOpenURL(deepLink);
    if (supported) {
      await Linking.openURL(deepLink);
    } else {
      // Fallback to web URL
      await Linking.openURL(webLink);
    }
  } catch (error) {
    console.error("Failed to open deep link:", error);
    // Last resort: try web link
    try {
      await Linking.openURL(webLink);
    } catch (webError) {
      console.error("Failed to open web link:", webError);
    }
  }
};

/**
 * Get shareable links for a workout
 * @param {string} workoutId - The workout ID
 * @param {Object} workout - The workout object
 * @returns {Object} - Object containing app link and web link
 */
export const getShareableWorkoutLinks = (workoutId, workout) => {
  const appLink = generateDeepLink("workout-details", { id: workoutId });
  const webLink = generateWebLink(`workout/${workoutId}`, {
    title: workout?.title?.replace(/\s+/g, "-").toLowerCase(),
  });

  return { appLink, webLink };
};
