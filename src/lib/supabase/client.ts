// Importers/Callers: src/context/AppContext.tsx, auth pages, and client components
// Affected API: Supabase Client Instance, Google OAuth Helper
// Data Schemas: SupabaseClient
// User's Verbatim Instruction: "When user click upgrade automatically update the plan make change like when the user click the upgrade it need to redirect to my reserve pay and show the related payment method and amountAnd what do you think about firewall we can set up google login also right It is more secure than just using email and password if this can work for free let's set up that"

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export async function signInWithGooglePopup() {
  const supabase = getSupabase();
  try {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo,
      },
    });
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}
