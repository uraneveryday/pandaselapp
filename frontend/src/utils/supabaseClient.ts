// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

// 딱 한 번만 생성해서 export 합니다!
export const supabase = createClient(supabaseUrl, supabaseKey);