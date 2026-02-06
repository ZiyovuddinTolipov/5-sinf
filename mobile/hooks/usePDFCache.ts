import { useState, useEffect } from "react";
import { File, Directory, Paths } from "expo-file-system";
import { supabase } from "../lib/supabase";

export function usePDFCache(
  lessonId: string,
  pdfUrl: string | null,
  userId: string | undefined
) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const cacheDir = new Directory(Paths.document, "lesson-pdfs");
  const localFile = new File(cacheDir, `${lessonId}.pdf`);

  useEffect(() => {
    checkCache();
  }, [lessonId]);

  const checkCache = async () => {
    try {
      if (localFile.exists) {
        setLocalUri(localFile.uri);
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
      if (!cacheDir.exists) {
        cacheDir.create();
      }

      // Use fetch to download
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Write to file using the new API
      localFile.write(uint8Array);
      setProgress(1);
      setLocalUri(localFile.uri);

      // Track in user_lessons
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
      localFile.delete();
      setLocalUri(null);
    } catch {
      // ignore
    }
  };

  return { localUri, downloading, progress, downloadPDF, clearCache };
}
