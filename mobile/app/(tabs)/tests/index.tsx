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
import { api } from "../../../lib/api";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Colors } from "../../../constants/colors";

interface SubjectWithCount {
  id: string;
  name: string;
  test_count: number;
  active_count: number;
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
  // Common fallbacks/alternatives
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
  return "clipboard";
}

export default function TestsScreen() {
  const [subjects, setSubjects] = useState<SubjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const [subjectsData, testsData] = await Promise.all([
        api.get<{ id: string; name: string }[]>("/api/subjects"),
        api.get<{ id: string; subject_id: string; start_time: string; end_time: string }[]>(
          "/api/tests",
        ),
      ]);

      const result: SubjectWithCount[] = subjectsData.map((s) => {
        const subjectTests = testsData.filter((t) => t.subject_id === s.id);
        const activeTests = subjectTests.filter((t) => {
          const parseTS = (s: string) => new Date(s.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
          const start = parseTS(t.start_time);
          const end = parseTS(t.end_time);
          const nowDate = new Date();
          return nowDate >= start && nowDate <= end;
        });
        return {
          id: s.id,
          name: s.name,
          test_count: subjectTests.length,
          active_count: activeTests.length,
        };
      });

      setSubjects(result);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
    }
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
          <Ionicons name="school-outline" size={48} color={Colors.mutedLight} />
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
                  pathname: "/tests/subject/[subjectId]",
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
                {subject.test_count} ta test
              </Text>
              {subject.active_count > 0 && (
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>
                    {subject.active_count} faol
                  </Text>
                </View>
              )}
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
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  activeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.success,
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
