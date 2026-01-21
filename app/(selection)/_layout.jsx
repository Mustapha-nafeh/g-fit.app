import { Stack } from "expo-router";

export default function SelectionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="select-app" options={{ title: "Select-app", headerShown: false, animation: "fade" }} />
      <Stack.Screen name="select-payment" options={{ title: "Select-payment", headerShown: false }} />
      <Stack.Screen name="select-user" options={{ title: "Select-user", headerShown: false }} />
      <Stack.Screen name="card-details" options={{ title: "Card-details", headerShown: false }} />
      <Stack.Screen name="subscribe" options={{ title: "Subscribe", headerShown: false }} />
      <Stack.Screen name="success" options={{ title: "Success", headerShown: false }} />
    </Stack>
  );
}
