import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, Stack } from "expo-router";
import { useLessons } from "../../../../hooks/useLessons";
import { LessonCard } from "../../../../components/LessonCard";
import { PDFViewer } from "../../../../components/PDFViewer";
import { LoadingSpinner } from "../../../../components/LoadingSpinner";
import { Colors } from "../../../../constants/colors";
import type { LessonWithSubject } from "../../../../types";

export default function SubjectLessonsScreen() {
  const { subjectId, subjectName } = useLocalSearchParams<{
    subjectId: string;
    subjectName: string;
  }>();
  const [search, setSearch] = useState("");
  const { lessons, loading, refetch } = useLessons(subjectId);
  const [pdfLesson, setPdfLesson] = useState<LessonWithSubject | null>(null);

  const filteredLessons = useMemo(() => {
    if (!search.trim()) return lessons;
    const q = search.toLowerCase();
    return lessons.filter((l) => l.title.toLowerCase().includes(q));
  }, [lessons, search]);

  return (
    <>
      <Stack.Screen options={{ title: subjectName ?? "Darsliklar" }} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Darslik qidirish..."
            placeholderTextColor={Colors.mutedLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.mutedLight} />
            </TouchableOpacity>
          )}
        </View>

        {loading && filteredLessons.length === 0 ? (
          <LoadingSpinner />
        ) : filteredLessons.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={Colors.mutedLight} />
            <Text style={styles.emptyText}>
              {search ? "Darsliklar topilmadi" : "Bu fanda darsliklar yo'q"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredLessons}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LessonCard lesson={item} onPress={() => setPdfLesson(item)} />
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refetch} />
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.foreground,
  },
  list: {
    padding: 16,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.mutedLight,
  },
});
