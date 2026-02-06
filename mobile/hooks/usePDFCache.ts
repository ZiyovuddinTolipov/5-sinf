import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../lib/supabase";

const CACHE_DIR = FileSystem.documentDirectory + "lesson-pdfs/";

export function usePDFCache(
  lessonId: string,
  pdfUrl: string | null,
  userId: string | undefined
) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const localFilePath = CACHE_DIR + `${lessonId}.pdf`;

  useEffect(() => {
    checkCache();
  }, [lessonId]);

  const checkCache = async () => {
    try {
      const info = await FileSystem.getInfoAsync(localFilePath);
      if (info.exists) {
        setLocalUri(localFilePath);
      }
    } catch {
      // File doesn't exist
    }
  };

  const downloadPDF = async () => {
    if (!pdfUrl || !userId) return;

    setDownloading(true);
    setProgress(0);

    try {
      // Papka mavjudligini tekshirish
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }

      // Faylni yuklab olish
      const downloadResult = await FileSystem.createDownloadResumable(
        pdfUrl,
        localFilePath,
        {},
        (downloadProgress) => {
          const p =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setProgress(p);
        }
      ).downloadAsync();

      if (downloadResult?.uri) {
        setLocalUri(downloadResult.uri);
      }

      // user_lessons da saqlash
      await supabase.from("user_lessons").upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          downloaded: true,
          downloaded_version: 1,
        },
        { onConflict: "user_id,lesson_id" }
      );
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  const clearCache = async () => {
    try {
      await FileSystem.deleteAsync(localFilePath, { idempotent: true });
      setLocalUri(null);
    } catch {
      // ignore
    }
  };

  return { localUri, downloading, progress, downloadPDF, clearCache };
}
