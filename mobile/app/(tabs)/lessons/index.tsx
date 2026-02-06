import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Colors } from "../../../constants/colors";

interface SubjectWithCount {
  id: string;
  name: string;
  lesson_count: number;
}

const SUBJECT_ICONS: Record<string, string> = {
  Matematika: "calculator",
  Informatika: "desktop",
  "Tasviriy san'at": "color-palette",
  Texnologiya: "construct",
  Geografiya: "globe",
  "Rus tili": "language",
  Tarix: "time",
  "Ona tili": "text",
  Musiqa: "musical-notes",
  "Jismoniy tarbiya": "football",
  "Ingliz tili": "language",
  Biologiya: "leaf",
  Adabiyot: "book",
  "O'qish": "book",
  Ingliz: "language",
  Tabiat: "leaf",
};

function getIcon(name: string): string {
  for (const key of Object.keys(SUBJECT_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return SUBJECT_ICONS[key];
    }
  }
  return "book-outline";
}

export default function LessonsScreen() {
  const [subjects, setSubjects] = useState<SubjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    setLoading(true);

    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("id, name")
      .order("name");

    if (!subjectsData) {
      setLoading(false);
      return;
    }

    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("id, subject_id");

    const lessons = lessonsData ?? [];

    const result: SubjectWithCount[] = subjectsData.map((s) => {
      const subjectLessons = lessons.filter((l) => l.subject_id === s.id);
      return {
        id: s.id,
        name: s.name,
        lesson_count: subjectLessons.length,
      };
    });

    setSubjects(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  if (loading && subjects.length === 0) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchSubjects} />
      }
    >
      <Text style={styles.subtitle}>Fan tanlang</Text>

      {subjects.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={48} color={Colors.mutedLight} />
          <Text style={styles.emptyText}>Fanlar topilmadi</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/lessons/subject/[subjectId]",
                  params: { subjectId: subject.id, subjectName: subject.name },
                })
              }
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIcon(subject.name) as any}
                  size={28}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.cardName} numberOfLines={1}>
                {subject.name}
              </Text>
              <Text style={styles.cardCount}>
                {subject.lesson_count} ta darslik
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.muted,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.foreground,
    textAlign: "center",
  },
  cardCount: {
    fontSize: 13,
    color: Colors.muted,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.mutedLight,
  },
});
