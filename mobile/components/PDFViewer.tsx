import { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { Colors } from "../constants/colors";
import { usePDFCache } from "../hooks/usePDFCache";
import { useAuth } from "../lib/auth";

interface Props {
  lessonId: string;
  pdfUrl: string | null;
  title?: string;
  onClose: () => void;
}

export function PDFViewer({ lessonId, pdfUrl, title, onClose }: Props) {
  const { user } = useAuth();
  const { localUri, downloading, progress, downloadPDF, clearCache } =
    usePDFCache(lessonId, pdfUrl, user?.id);
  const [webLoading, setWebLoading] = useState(true);

  if (!pdfUrl) {
    return (
      <View style={styles.error}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
        <Text style={styles.errorText}>PDF mavjud emas</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Yopish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const viewUri = localUri
    ? localUri
    : `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  const handleShare = async () => {
    if (!localUri) return;
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(localUri);
    }
  };

  const handleDownloadToggle = () => {
    if (localUri) {
      Alert.alert(
        "Keshni tozalash",
        "Yuklab olingan faylni o'chirishni xohlaysizmi?",
        [
          { text: "Bekor qilish", style: "cancel" },
          { text: "O'chirish", onPress: clearCache, style: "destructive" },
        ]
      );
    } else {
      downloadPDF();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.foreground} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ?? "PDF"}
        </Text>

        <View style={styles.headerActions}>
          {localUri && (
            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color={Colors.foreground} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleDownloadToggle}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons
                name={localUri ? "checkmark-circle" : "download-outline"}
                size={22}
                color={localUri ? Colors.success : Colors.primary}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {downloading && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}

      {webLoading && !downloading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>PDF yuklanmoqda...</Text>
        </View>
      )}

      <WebView
        source={{ uri: viewUri }}
        style={styles.webview}
        onLoadStart={() => setWebLoading(true)}
        onLoadEnd={() => setWebLoading(false)}
        onError={() => {
          setWebLoading(false);
          Alert.alert("Xatolik", "PDF yuklashda xatolik yuz berdi");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.foreground,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.muted,
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
});
