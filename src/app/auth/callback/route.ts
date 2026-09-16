// Importers/Callers: Supabase OAuth redirect URL, Auth PKCE exchange handler for Google Login & unified user-business data linking
// Affected API: Next.js App Router Route Handler `/auth/callback`
// Data Schemas: Supabase Session, User, Business, StaffMember from src/lib/types.ts
// User's Verbatim Instruction: "There is a problem I seen When I use my Gmail Google for login I don't get directly logged into Existent account in Website Say that's the normal big company do right if we log in using Google with existing email It should be login into our Website with our data right Fix And push it to Github"

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component or Route Handler.
          }
        },
      },
    });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !session?.user) {
      console.error("OAuth code exchange error:", sessionError);
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=oauth_failed`);
    }

    const userId = session.user.id;
    const userEmail = session.user.email?.toLowerCase().trim() || "";
    const userName =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      userEmail.split("@")[0];

    // Using service role to bypass RLS and link data seamlessly across login methods
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Check if user profile already exists with a business_id by auth UID
    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("id, business_id, role")
      .eq("id", userId)
      .maybeSingle();

    if (userProfile?.business_id) {
      if (userProfile.role === "staff" || userProfile.role === "manager") {
        return NextResponse.redirect(`${requestUrl.origin}/add-visit`);
      }
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }

    // 2. Check if a user record exists with the exact same email (from email/password signup)
    const { data: userByEmail } = await supabaseAdmin
      .from("users")
      .select("id, business_id, role, full_name")
      .ilike("email", userEmail)
      .not("business_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (userByEmail?.business_id) {
      // Link the current Google auth user ID to this business workspace
      await supabaseAdmin.from("users").upsert({
        id: userId,
        business_id: userByEmail.business_id,
        email: userEmail,
        full_name: userName || userByEmail.full_name,
        role: userByEmail.role || "owner",
      });

      if (userByEmail.role === "staff" || userByEmail.role === "manager") {
        return NextResponse.redirect(`${requestUrl.origin}/add-visit`);
      }
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }

    // 3. Check if user already owns a business by email in businesses table
    const { data: existingBusiness } = await supabaseAdmin
      .from("businesses")
      .select("id, name, owner_name")
      .ilike("owner_email", userEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingBusiness) {
      await supabaseAdmin.from("users").upsert({
        id: userId,
        business_id: existingBusiness.id,
        email: userEmail,
        full_name: userName || existingBusiness.owner_name || "Owner",
        role: "owner",
      });
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }

    // 4. New Google OAuth user without an existing workspace -> Route to quick Onboarding
    return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
}
