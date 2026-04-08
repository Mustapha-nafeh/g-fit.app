import { useEffect, useState, useCallback, useRef } from "react";
import { Platform } from "react-native";
import {
  initConnection,
  endConnection,
  fetchProducts,
  getAvailablePurchases,
  getTransactionJwsIOS,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
} from "react-native-iap";
import { SUBSCRIPTION_ID, PRODUCT_IDS } from "../utils/iap";
import { verifyPurchaseApi } from "../api/iapApi";
import { useGlobalContext } from "../context/GlobalContext";

export const PURCHASE_STATE = {
  IDLE: "idle",
  REQUESTING: "requesting",
  PROCESSING: "processing",
  VERIFYING: "verifying",
  SUCCESS: "success",
  ERROR: "error",
};

// ─── Platform-specific helpers ───────────────────────────────────────────────

async function buildVerifyPayload(purchase) {
  if (Platform.OS === "ios") {
    let jwsRepresentation = null;
    try {
      jwsRepresentation = await getTransactionJwsIOS(purchase.transactionId);
    } catch (err) {
      console.warn("[IAP] Could not fetch JWS:", err);
    }
    return {
      store: "apple",
      productId: purchase.productId,
      transactionId: purchase.transactionId,
      jwsRepresentation,
    };
  }
  // Android
  return {
    store: "google",
    productId: purchase.productId,
    transactionId: purchase.transactionId,
    purchaseToken: purchase.purchaseToken,
    packageNameAndroid: purchase.packageNameAndroid,
  };
}

function buildPurchaseRequest() {
  return {
    request: {
      apple: { sku: SUBSCRIPTION_ID },
      // TODO: Android
      // google: { skus: [SUBSCRIPTION_ID] },
    },
    type: "subs",
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useIAP() {
  const { fetchProfile } = useGlobalContext();
  const [purchaseState, setPurchaseState] = useState(PURCHASE_STATE.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const purchaseUpdateSub = useRef(null);
  const purchaseErrorSub = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const init = async () => {
      try {
        await initConnection();

        purchaseUpdateSub.current = purchaseUpdatedListener(async (purchase) => {
          if (!purchase?.transactionId) return;

          try {
            if (mounted.current) setPurchaseState(PURCHASE_STATE.PROCESSING);
            await finishTransaction({ purchase, isConsumable: false });

            if (mounted.current) setPurchaseState(PURCHASE_STATE.VERIFYING);
            const payload = await buildVerifyPayload(purchase);
            await verifyPurchaseApi(payload);

            await fetchProfile();
            if (mounted.current) setPurchaseState(PURCHASE_STATE.SUCCESS);
          } catch (err) {
            if (err?.response?.status === 404) {
              console.warn("[IAP] Already processed, rechecking profile.");
              await fetchProfile();
              if (mounted.current) setPurchaseState(PURCHASE_STATE.IDLE);
              return;
            }
            console.error("[IAP] Transaction failed:", err);
            if (mounted.current) {
              setErrorMessage("Purchase completed but verification failed. Please contact support.");
              setPurchaseState(PURCHASE_STATE.ERROR);
            }
          }
        });

        purchaseErrorSub.current = purchaseErrorListener(async (err) => {
          if (err.code === "E_USER_CANCELLED") {
            if (mounted.current) setPurchaseState(PURCHASE_STATE.IDLE);
            return;
          }
          if (!err.productId && err.code === "sku-not-found") {
            console.warn("[IAP] Ignoring ghost sku-not-found error from sandbox.");
            return;
          }
          if (err.message?.includes("Duplicate purchase update skipped")) {
            console.warn("[IAP] Duplicate purchase, rechecking profile.");
            await fetchProfile();
            if (mounted.current) setPurchaseState(PURCHASE_STATE.IDLE);
            return;
          }
          console.error("[IAP] Purchase error:", err);
          if (mounted.current) {
            setErrorMessage(err.message || "Purchase failed. Please try again.");
            setPurchaseState(PURCHASE_STATE.ERROR);
          }
        });

        const [subs, available] = await Promise.allSettled([
          fetchProducts({ skus: PRODUCT_IDS, type: "subs" }),
          getAvailablePurchases(),
        ]);

        if (subs.status === "fulfilled" && subs.value?.length > 0) {
          if (mounted.current) setProductInfo(subs.value[0]);
        } else if (subs.status === "rejected") {
          console.warn("[IAP] Could not fetch product info:", subs.reason);
        }
        if (mounted.current) setIsProductLoading(false);

        if (available.status === "fulfilled") {
          for (const purchase of available.value) {
            await finishTransaction({ purchase, isConsumable: false });
          }
        } else {
          console.warn("[IAP] Could not drain pending transactions:", available.reason);
        }
      } catch (err) {
        console.error("[IAP] Init failed:", err);
      }
    };

    init();

    return () => {
      mounted.current = false;
      purchaseUpdateSub.current?.remove();
      purchaseErrorSub.current?.remove();
      endConnection();
    };
  }, []);

  const subscribe = useCallback(async () => {
    setErrorMessage(null);
    setPurchaseState(PURCHASE_STATE.REQUESTING);
    try {
      await requestPurchase(buildPurchaseRequest());
    } catch (err) {
      if (err.code === "E_USER_CANCELLED") {
        setPurchaseState(PURCHASE_STATE.IDLE);
        return;
      }
      console.error("[IAP] requestPurchase failed:", err);
      setErrorMessage(err.message || "Could not initiate purchase. Please try again.");
      setPurchaseState(PURCHASE_STATE.ERROR);
    }
  }, []);

  const resetError = useCallback(() => {
    setErrorMessage(null);
    setPurchaseState(PURCHASE_STATE.IDLE);
  }, []);

  return {
    purchaseState,
    errorMessage,
    productInfo,
    isProductLoading,
    subscribe,
    resetError,
    isLoading:
      purchaseState === PURCHASE_STATE.REQUESTING ||
      purchaseState === PURCHASE_STATE.PROCESSING ||
      purchaseState === PURCHASE_STATE.VERIFYING,
  };
}
