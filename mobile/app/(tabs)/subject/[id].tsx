import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSubjects } from "../../../hooks/useSubjects";
import { useLessons } from "../../../hooks/useLessons";
import { useTests } from "../../../hooks/useTests";
import { LessonCard } from "../../../components/LessonCard";
import { TestCard } from "../../../components/TestCard";
import { PDFViewer } from "../../../components/PDFViewer";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Colors } from "../../../constants/colors";
import type { LessonWithSubject, TestWithSubject } from "../../../types";

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subjects } = useSubjects();
  const { lessons, loading: lessonsLoading, refetch: refetchLessons } = useLessons(id);
  const { tests, loading: testsLoading, refetch: refetchTests } = useTests(id);
  const [activeTab, setActiveTab] = useState<"lessons" | "tests">("lessons");
  const [pdfLesson, setPdfLesson] = useState<LessonWithSubject | null>(null);

  const subject = subjects.find((s) => s.id === id);
  const loading = lessonsLoading || testsLoading;

  const handleRefresh = () => {
    refetchLessons();
    refetchTests();
  };

  if (!subject && !loading) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Fan topilmadi</Text>
      </View>
    );
  }

  type ListItem =
    | { type: "header"; title: string }
    | { type: "lesson"; lesson: LessonWithSubject }
    | { type: "test"; test: TestWithSubject };

  const getLessonsData = (): ListItem[] =>
    lessons.map((l) => ({ type: "lesson" as const, lesson: l }));

  const getTestsData = (): ListItem[] => {
    const now = new Date();
    const active = tests.filter((t) => new Date(t.start_time) <= now && now <= new Date(t.end_time));
    const upcoming = tests.filter((t) => now < new Date(t.start_time));
    const closed = tests.filter((t) => now > new Date(t.end_time));

    const items: ListItem[] = [];
    if (active.length > 0) {
      items.push({ type: "header", title: "Faol testlar" });
      active.forEach((t) => items.push({ type: "test", test: t }));
    }
    if (upcoming.length > 0) {
      items.push({ type: "header", title: "Kutilmoqda" });
      upcoming.forEach((t) => items.push({ type: "test", test: t }));
    }
    if (closed.length > 0) {
      items.push({ type: "header", title: "Yopilgan" });
      closed.forEach((t) => items.push({ type: "test", test: t }));
    }
    return items;
  };

  const data = activeTab === "lessons" ? getLessonsData() : getTestsData();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{subject?.name ?? "..."}</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "lessons" && styles.tabActive]}
            onPress={() => setActiveTab("lessons")}
          >
            <Ionicons
              name="book"
              size={16}
              color={activeTab === "lessons" ? Colors.white : Colors.muted}
            />
            <Text style={[styles.tabText, activeTab === "lessons" && styles.tabTextActive]}>
              Darsliklar ({lessons.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "tests" && styles.tabActive]}
            onPress={() => setActiveTab("tests")}
          >
            <Ionicons
              name="clipboard"
              size={16}
              color={activeTab === "tests" ? Colors.white : Colors.muted}
            />
            <Text style={[styles.tabText, activeTab === "tests" && styles.tabTextActive]}>
              Testlar ({tests.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && data.length === 0 ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {activeTab === "lessons" ? "Darsliklar topilmadi" : "Testlar topilmadi"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => {
            if (item.type === "header") return `h-${item.title}-${i}`;
            if (item.type === "lesson") return item.lesson.id;
            return item.test.id;
          }}
          renderItem={({ item }) => {
            if (item.type === "header") {
              return <Text style={styles.sectionTitle}>{item.title}</Text>;
            }
            if (item.type === "lesson") {
              return (
                <LessonCard
                  lesson={item.lesson}
                  onPress={() => setPdfLesson(item.lesson)}
                />
              );
            }
            return (
              <TestCard
                test={item.test}
                onPress={() => router.push(`/tests/${item.test.id}`)}
              />
            );
          }}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {pdfLesson && (
        <Modal visible={!!pdfLesson} animationType="slide">
          <PDFViewer
            lessonId={pdfLesson.id}
            pdfUrl={pdfLesson.pdf_url}
            title={pdfLesson.title}
            onClose={() => setPdfLesson(null)}
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.foreground,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    borderRadius: 10,
    backgroundColor: Colors.background,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.muted,
  },
  tabTextActive: {
    color: Colors.white,
  },
  list: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.foreground,
    marginTop: 8,
    marginBottom: 10,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.mutedLight,
  },
});
