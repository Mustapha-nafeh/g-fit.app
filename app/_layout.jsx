import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GlobalProvider } from "../context/GlobalContext";
import {
  useFonts,
  MontserratAlternates_400Regular,
  MontserratAlternates_700Bold,
  MontserratAlternates_600SemiBold,
} from "@expo-google-fonts/montserrat-alternates";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    MontserratAlternates_400Regular,
    MontserratAlternates_700Bold,
    MontserratAlternates_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalProvider>
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(selection)" options={{ headerShown: false }} />
            <Stack.Screen name="(coachApp)" options={{ headerShown: false }} />
            <Stack.Screen name="(gfit)" options={{ headerShown: false }} />
            <Stack.Screen name="(gtkf)" options={{ headerShown: false }} />
          </Stack>
          <Toast />
        </QueryClientProvider>
      </GlobalProvider>
    </GestureHandlerRootView>
  );
}
