import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dshtscrgfqymyfhuuplp.supabase.co";
const supabaseAnonKey = "YOUR_ANON_PUBLIC_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);