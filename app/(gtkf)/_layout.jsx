import { Stack } from "expo-router";

export default function GtkfLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="articles"
        options={{
          title: "Articles",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="workouts"
        options={{
          title: "Workouts",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="workout-details"
        options={{
          title: "WorkoutDetails",
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="article-details"
        options={{
          title: "ArticleDetails",
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
