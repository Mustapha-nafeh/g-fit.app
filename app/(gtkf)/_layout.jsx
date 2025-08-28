import { Stack } from "expo-router";

export default function GtkfLayout() {
  return (
    <Stack>
      <Stack.Screen name="articles" options={{ title: "Articles", headerShown: false }} />
      <Stack.Screen name="workouts" options={{ title: "Workouts", headerShown: false }} />
      <Stack.Screen name="workout-details" options={{ title: "WorkoutDetails", headerShown: false }} />
      <Stack.Screen name="article-details" options={{ title: "ArticleDetails", headerShown: false }} />
    </Stack>
  );
}
