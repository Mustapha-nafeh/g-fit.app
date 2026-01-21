import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="get-started" options={{ title: "GetStarted", headerShown: false }} />
    </Stack>
  );
}
