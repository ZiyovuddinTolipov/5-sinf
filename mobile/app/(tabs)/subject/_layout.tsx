import { Stack } from "expo-router";
import { Colors } from "../../../constants/colors";

export default function SubjectLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.foreground,
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: "",
        }}
      />
    </Stack>
  );
}
