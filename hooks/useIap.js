// src/hooks/useIAP.js

import { useEffect, useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
} from "react-native-iap";
import { PRODUCT_IDS, SUBSCRIPTION_ID } from "../utils/iap";
import { useVerifyPurchase } from "../api/iapApi";

const productIds = Platform.select(PRODUCT_IDS);

export function useIAP() {
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [{ mutate: verifyPurchase }] = useVerifyPurchase();

  useEffect(() => {
    let purchaseUpdateSub;
    let purchaseErrorSub;

    const init = async () => {
      try {
        await initConnection();

        // Fetch the subscription product
        const subs = await getSubscriptions({ skus: productIds });
        if (subs.length > 0) setSubscription(subs[0]);

        // Check if user already has an active subscription
        await checkExistingPurchases();

        // Listen for purchase completions
        purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
          try {
            await finishTransaction({ purchase, isConsumable: false });
            setIsSubscribed(true);

            // send to your backend for validation
            await verifyPurchase(purchase);
          } catch (err) {
            console.error("Purchase error", err);
          }
        });

        purchaseErrorSub = purchaseErrorListener((err) => {
          if (err.code !== "E_USER_CANCELLED") {
            setError(err.message);
            Alert.alert("Purchase Error", err.message);
          }
        });
      } catch (err) {
        console.error("IAP init error", err);
        setError(err.message);
      }
    };

    init();

    return () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      endConnection();
    };
  }, []);

  const checkExistingPurchases = async () => {
    try {
      const purchases = await getAvailablePurchases();
      const active = purchases.find((p) => p.productId === SUBSCRIPTION_ID);
      setIsSubscribed(!!active);
    } catch (err) {
      console.error("Could not check purchases", err);
    }
  };

  const subscribe = useCallback(async () => {
    if (!subscription) return;
    setLoading(true);
    setError(null);
    try {
      await requestSubscription({ sku: subscription.productId });
    } catch (err) {
      if (err.code !== "E_USER_CANCELLED") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  return {
    subscription,
    isSubscribed,
    loading,
    error,
    subscribe,
    checkExistingPurchases,
  };
}
