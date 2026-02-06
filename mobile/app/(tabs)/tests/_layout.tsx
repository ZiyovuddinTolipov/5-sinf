import { Stack } from "expo-router";
import { Colors } from "../../../constants/colors";

export default function TestsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.foreground,
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Testlar" }} />
      <Stack.Screen name="[id]" options={{ title: "Test" }} />
    </Stack>
  );
}
