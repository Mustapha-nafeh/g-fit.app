import axios from "axios";
import * as SecureStore from "expo-secure-store";

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

export default apiClient;
