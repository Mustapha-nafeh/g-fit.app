import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const API_BASE_URL = process.env.API_BASE_URL || extra.apiBaseUrl || "https://backend.g-fit.app/api/v1";

export const STORAGE_BASE_URL =
  process.env.STORAGE_BASE_URL || extra.storageBaseUrl || "https://backend.g-fit.app/storage";
