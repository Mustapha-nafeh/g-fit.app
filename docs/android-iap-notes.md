# Android IAP Setup Notes

When Android billing is ready, apply the following changes to `hooks/useIap.js`.

---

## 1. `subscribe()` — pass offerToken (required by Google Play Billing v7+)

Google Play Billing Library v7+ requires `subscriptionOffers: [{ sku, offerToken }]`
in the purchase request. The `offerToken` comes from the fetched product's
`subscriptionOfferDetailsAndroid`. Without it, purchases will fail silently.

Replace the `requestPurchase` call in `subscribe()` and add `productInfo` to deps:

```js
const androidOffers = productInfo?.subscriptionOfferDetailsAndroid?.map((offer) => ({
  sku: SUBSCRIPTION_ID,
  offerToken: offer.offerToken,
})) ?? [];

await requestPurchase({
  request: {
    apple: { sku: SUBSCRIPTION_ID },
    google: {
      skus: [SUBSCRIPTION_ID],
      subscriptionOffers: androidOffers,
    },
  },
  type: "subs",
});
// ...
}, [productInfo]); // add productInfo to useCallback deps
```

---

## 2. `purchaseUpdatedListener` — acknowledge instead of finish for Android subscriptions

On Android, `finishTransaction` is for consumables. Subscriptions must be
**acknowledged** within 3 days or Google auto-refunds them. In react-native-iap v14
use `acknowledgePurchaseAndroid`:

```js
import { acknowledgePurchaseAndroid } from "react-native-iap";

// Inside purchaseUpdatedListener, replace:
await finishTransaction({ purchase, isConsumable: false });

// With:
if (Platform.OS === "android") {
  await acknowledgePurchaseAndroid({ token: purchase.purchaseToken });
} else {
  await finishTransaction({ purchase, isConsumable: false });
}
```

---

## 3. `getAvailablePurchases` drain — skip Android or handle separately

The init drain loop calls `finishTransaction` on all available purchases.
On Android this is incorrect for subscriptions (see point 2 above).
Guard it to iOS only, or handle Android purchases separately:

```js
const available = await getAvailablePurchases();
for (const purchase of available) {
  if (Platform.OS === "android") {
    if (purchase.purchaseToken && !purchase.isAcknowledgedAndroid) {
      await acknowledgePurchaseAndroid({ token: purchase.purchaseToken });
    }
  } else {
    await finishTransaction({ purchase, isConsumable: false });
  }
}
```

---

## 4. `verifyPurchaseApi` — already handled

The `purchaseUpdatedListener` already passes `purchaseToken` and `packageNameAndroid`
for Android — no changes needed there.

## 5. Period display — already handled

`subscribe.jsx` already reads `subscriptionOffers[0]?.period?.unit` as the
Android fallback for the period label — no changes needed.
