import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import type { TestResult } from "../types";

interface Props {
  result: TestResult;
}

export function TestResultCard({ result }: Props) {
  const percentage = result.total_questions > 0
    ? Math.round((result.correct_answers / result.total_questions) * 100)
    : 0;
  const isPassed = percentage >= 60;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, isPassed ? styles.iconPassed : styles.iconFailed]}>
          <Ionicons
            name={isPassed ? "checkmark-circle" : "close-circle"}
            size={20}
            color={isPassed ? Colors.success : Colors.danger}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.testName} numberOfLines={1}>
            {result.test_name}
          </Text>
          <Text style={styles.subject}>{result.subject_name}</Text>
        </View>
        <Text style={[styles.percentage, isPassed ? styles.passedText : styles.failedText]}>
          {percentage}%
        </Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="star" size={14} color={Colors.warning} />
          <Text style={styles.statText}>
            {result.earned_points}/{result.total_points} ball
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="checkmark-done" size={14} color={Colors.success} />
          <Text style={styles.statText}>
            {result.correct_answers}/{result.total_questions} to'g'ri
          </Text>
        </View>
      </View>
    </View>
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
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPassed: {
    backgroundColor: Colors.successLight,
  },
  iconFailed: {
    backgroundColor: Colors.dangerLight,
  },
  info: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 2,
  },
  subject: {
    fontSize: 11,
    color: Colors.muted,
  },
  percentage: {
    fontSize: 20,
    fontWeight: "800",
  },
  passedText: {
    color: Colors.success,
  },
  failedText: {
    color: Colors.danger,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: "500",
  },
});
