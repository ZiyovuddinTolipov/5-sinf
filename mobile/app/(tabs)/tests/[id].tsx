import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../lib/auth";
import { useTestQuestions } from "../../../hooks/useTests";
import { supabase } from "../../../lib/supabase";
import { QuestionView } from "../../../components/QuestionView";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Colors } from "../../../constants/colors";

export default function TestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { questions, loading } = useTestQuestions(id);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number; points: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingSpinner />;

  if (questions.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.mutedLight} />
        <Text style={styles.emptyText}>Bu testda savollar yo'q</Text>
      </View>
    );
  }

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const allAnswered = questions.every((q) => answers[q.id]);

  const handleSelect = (option: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrent((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!allAnswered) {
      Alert.alert("Ogohlantirish", "Barcha savollarga javob bering!");
      return;
    }

    Alert.alert("Testni tugatish", "Javoblaringizni yuborishni xohlaysizmi?", [
      { text: "Bekor qilish", style: "cancel" },
      {
        text: "Yuborish",
        onPress: async () => {
          setSubmitting(true);
          let correct = 0;
          let totalPoints = 0;

          const inserts = questions.map((q) => {
            const selected = answers[q.id];
            const isCorrect = selected === q.correct_option;
            if (isCorrect) {
              correct++;
              totalPoints += q.points;
            }
            return {
              user_id: user.id,
              question_id: q.id,
              selected_option: selected,
              points_earned: isCorrect ? q.points : 0,
            };
          });

          const { error } = await supabase.from("user_tests").insert(inserts);

          if (error) {
            Alert.alert("Xatolik", error.message.includes("unique")
              ? "Siz bu testni allaqachon yechgansiz!"
              : error.message
            );
            setSubmitting(false);
            return;
          }

          setResult({ correct, total: questions.length, points: totalPoints });
          setSubmitted(true);
          setSubmitting(false);
        },
      },
    ]);
  };

  if (submitted && result) {
    const maxPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((result.correct / result.total) * 100);

    return (
      <ScrollView style={styles.resultContainer} contentContainerStyle={styles.resultContent}>
        <View style={styles.resultCard}>
          <Ionicons
            name={percentage >= 60 ? "checkmark-circle" : "close-circle"}
            size={64}
            color={percentage >= 60 ? Colors.success : Colors.danger}
          />
          <Text style={styles.resultTitle}>
            {percentage >= 60 ? "Tabriklaymiz!" : "Urinib ko'ring!"}
          </Text>
          <Text style={styles.percentage}>{percentage}%</Text>

          <View style={styles.resultStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{result.correct}</Text>
              <Text style={styles.statLabel}>To'g'ri</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statValue}>{result.total - result.correct}</Text>
              <Text style={styles.statLabel}>Noto'g'ri</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{result.points}/{maxPoints}</Text>
              <Text style={styles.statLabel}>Ball</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Testlarga qaytish</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <QuestionView
        question={question}
        index={current}
        total={questions.length}
        selected={answers[question.id] ?? null}
        onSelect={handleSelect}
      />
      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navButton, current === 0 && styles.navDisabled]}
          onPress={handlePrev}
          disabled={current === 0}
        >
          <Ionicons name="chevron-back" size={20} color={current === 0 ? Colors.mutedLight : Colors.foreground} />
          <Text style={[styles.navText, current === 0 && styles.navTextDisabled]}>Oldingi</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.navDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>
              {submitting ? "Yuborilmoqda..." : "Tugatish"}
            </Text>
            <Ionicons name="checkmark" size={20} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>Keyingi</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.mutedLight,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  navDisabled: {
    opacity: 0.4,
  },
  navText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.foreground,
  },
  navTextDisabled: {
    color: Colors.mutedLight,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  nextText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  resultContent: {
    padding: 20,
    alignItems: "center",
    paddingTop: 40,
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.foreground,
    marginTop: 8,
  },
  percentage: {
    fontSize: 48,
    fontWeight: "800",
    color: Colors.primary,
  },
  resultStats: {
    flexDirection: "row",
    marginTop: 16,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.muted,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
});
