import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://wumjphdpsaxghpayxykn.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1bWpwaGRwc2F4Z2hwYXl4eWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzMwNjksImV4cCI6MjA4NTk0OTA2OX0.6wi7HaId4XaFoSYuTwlt-ZkudZFTNnarkQdcVsiN4bc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
