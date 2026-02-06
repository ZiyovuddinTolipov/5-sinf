import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import type { LessonWithSubject } from "../types";

interface Props {
  lesson: LessonWithSubject;
  onPress: () => void;
}

export function LessonCard({ lesson, onPress }: Props) {
  const hasPdf = !!lesson.pdf_url;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={hasPdf ? onPress : undefined}
      disabled={!hasPdf}
      activeOpacity={hasPdf ? 0.7 : 1}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={hasPdf ? "document-text" : "document-outline"}
          size={24}
          color={hasPdf ? Colors.primary : Colors.mutedLight}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {lesson.title}
        </Text>
        <View style={styles.meta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {lesson.subjects?.name ?? "\u2014"}
            </Text>
          </View>
          <Text style={styles.version}>v{lesson.version}</Text>
        </View>
      </View>
      {hasPdf ? (
        <View style={styles.pdfButton}>
          <Ionicons name="eye" size={16} color={Colors.primary} />
          <Text style={styles.pdfButtonText}>PDF</Text>
        </View>
      ) : (
        <View style={styles.noPdf}>
          <Text style={styles.noPdfText}>Yo'q</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
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
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: "500",
  },
  version: {
    fontSize: 11,
    color: Colors.mutedLight,
  },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  pdfButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  noPdf: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  noPdfText: {
    fontSize: 12,
    color: Colors.mutedLight,
  },
});
