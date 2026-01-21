import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { showToast } from "../constants";

const apiClient = axios.create({
  baseURL: "https://g-fit.app/api/v1", // Your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the Authorization header dynamically
apiClient.interceptors.request.use(
  async (config) => {
    const rawToken = await SecureStore.getItemAsync("access_token");
    let token;

    if (rawToken) {
      try {
        // If the token is a JSON string, parse it and extract _j
        const parsedToken = JSON.parse(rawToken);
        token = parsedToken._j || rawToken; // Use _j if object, otherwise raw string
      } catch (e) {
        // If parsing fails (not JSON), assume it’s a plain string
        token = rawToken;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Set the header correctly
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 unauthorized responses
apiClient.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Show unauthorized toast
      showToast("error", "Unauthorized", "Your session has expired. Please login again.");

      // Clear stored tokens on 401
      try {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        await SecureStore.deleteItemAsync("member");
        await SecureStore.deleteItemAsync("token_key");
      } catch (clearError) {
        console.warn("Error clearing tokens:", clearError);
      }

      // Redirect to login page
      router.replace("/(auth)/login");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
