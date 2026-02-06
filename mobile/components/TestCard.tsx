import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import type { TestWithSubject } from "../types";

interface Props {
  test: TestWithSubject;
  onPress: () => void;
}

function getStatus(startTime: string, endTime: string) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return { label: "Kutilmoqda", color: Colors.primary, bg: Colors.primaryLight };
  if (now <= end) return { label: "Faol", color: Colors.success, bg: Colors.successLight };
  return { label: "Yopilgan", color: Colors.muted, bg: Colors.background };
}

function getQuestionCount(test: TestWithSubject): number {
  if (test.test_questions && test.test_questions.length > 0) {
    return test.test_questions[0].count;
  }
  return 0;
}

export function TestCard({ test, onPress }: Props) {
  const status = getStatus(test.start_time, test.end_time);
  const isActive = status.label === "Faol";
  const count = getQuestionCount(test);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!isActive}
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {test.name}
          </Text>
          <View style={styles.meta}>
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectText}>
                {test.subjects?.name ?? "\u2014"}
              </Text>
            </View>
            <Text style={styles.questionCount}>{count} ta savol</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>
      {isActive && (
        <View style={styles.startContainer}>
          <View style={styles.startButton}>
            <Ionicons name="play" size={14} color={Colors.white} />
            <Text style={styles.startText}>Boshlash</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 6,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subjectBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: "500",
  },
  questionCount: {
    fontSize: 11,
    color: Colors.mutedLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  startContainer: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  startText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
});
