import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import type { TestQuestion } from "../types";

interface Props {
  question: TestQuestion;
  index: number;
  total: number;
  selected: string | null;
  onSelect: (option: "A" | "B" | "C" | "D") => void;
}

export function QuestionView({ question, index, total, selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Savol {index + 1}/{total}
      </Text>
      <Text style={styles.questionText}>{question.question}</Text>
      <Text style={styles.points}>{question.points} ball</Text>
      <View style={styles.options}>
        {question.options.map((opt) => {
          const isSelected = selected === opt.label;
          return (
            <TouchableOpacity
              key={opt.label}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelect(opt.label)}
              activeOpacity={0.7}
            >
              <View style={[styles.label, isSelected && styles.labelSelected]}>
                <Text style={[styles.labelText, isSelected && styles.labelTextSelected]}>
                  {opt.label}
                </Text>
              </View>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progress: {
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "600",
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
    lineHeight: 26,
    marginBottom: 8,
  },
  points: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 24,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  label: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  labelSelected: {
    backgroundColor: Colors.primary,
  },
  labelText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.muted,
  },
  labelTextSelected: {
    color: Colors.white,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.foreground,
    lineHeight: 22,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: Colors.primary,
  },
});
