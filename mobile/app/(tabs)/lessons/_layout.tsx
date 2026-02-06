import { Stack } from "expo-router";
import { Colors } from "../../../constants/colors";

export default function LessonsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.foreground,
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Darsliklar" }} />
      <Stack.Screen name="subject/[subjectId]" options={{ title: "Darsliklar" }} />
    </Stack>
  );
}
