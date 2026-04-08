import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import { getProfileApi } from "../api/profile";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [member, setMember] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const fetchingProfile = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (fetchingProfile.current) return;
    fetchingProfile.current = true;
    try {
      const accessToken = await SecureStore.getItemAsync("access_token");
      if (!accessToken) return;
      const response = await getProfileApi();
      if (response?.data) {
        setMember(response.data);
        setIsSubscribed(!!response.data.is_subscribed);
      }
    } catch (err) {
      console.warn("[Profile] Could not fetch profile:", err);
    } finally {
      fetchingProfile.current = false;
    }
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("token_key");
    setMember(null);
    setIsSubscribed(false);
  }, []);

  return (
    <GlobalContext.Provider value={{ member, setMember, isSubscribed, setIsSubscribed, fetchProfile, signOut }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
