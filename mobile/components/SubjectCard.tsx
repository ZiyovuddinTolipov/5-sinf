import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import type { Subject } from "../types";

interface Props {
  subject: Subject;
  onPress: () => void;
}

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Matematika: "calculator",
  Fizika: "flash",
  Kimyo: "flask",
  Biologiya: "leaf",
  Tarix: "time",
  Geografiya: "globe",
  Informatika: "laptop",
  default: "book",
};

function getIcon(name: string): keyof typeof Ionicons.glyphMap {
  for (const [key, icon] of Object.entries(ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return ICONS.default;
}

export function SubjectCard({ subject, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon(subject.name)} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {subject.name}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.mutedLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.foreground,
  },
});
