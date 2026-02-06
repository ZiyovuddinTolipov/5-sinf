import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSubjects } from "../../hooks/useSubjects";
import { useLessons } from "../../hooks/useLessons";
import { LessonCard } from "../../components/LessonCard";
import { PDFViewer } from "../../components/PDFViewer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Colors } from "../../constants/colors";
import type { LessonWithSubject } from "../../types";

export default function LessonsScreen() {
  const params = useLocalSearchParams<{ subjectId?: string }>();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    params.subjectId
  );
  const { subjects } = useSubjects();
  const { lessons, loading, refetch } = useLessons(selectedSubject);
  const [pdfLesson, setPdfLesson] = useState<LessonWithSubject | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroll}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedSubject && styles.chipActive]}
          onPress={() => setSelectedSubject(undefined)}
        >
          <Text
            style={[styles.chipText, !selectedSubject && styles.chipTextActive]}
          >
            Barchasi
          </Text>
        </TouchableOpacity>
        {subjects.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.chip,
              selectedSubject === s.id && styles.chipActive,
            ]}
            onPress={() => setSelectedSubject(s.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedSubject === s.id && styles.chipTextActive,
              ]}
            >
              {s.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && lessons.length === 0 ? (
        <LoadingSpinner />
      ) : lessons.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Darsliklar topilmadi</Text>
        </View>
      ) : (
        <FlatList
          data={lessons}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chipScroll: {
    flexGrow: 0,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chips: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.muted,
  },
  chipTextActive: {
    color: Colors.white,
  },
  list: {
    padding: 16,
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
