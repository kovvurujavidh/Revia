// Importers/Callers: Supabase OAuth redirect URL, Auth PKCE exchange handler for Google Login & unified user-business data linking
// Affected API: Next.js App Router Route Handler `/auth/callback`
// Data Schemas: Supabase Session, User, Business, StaffMember from src/lib/types.ts
// User's Verbatim Instruction: "Email login is working now so remove the manual email entry and password entry keep that one also and keep email google login when the google login and email login and need to be connected and when the user just login using the email it need to go to next step of login and create account and when the user uses google login or email login with same email it need to show the same data and do it like this Think and what need to be added and what connections need to be done for better experience and security please add this"

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

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
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

    // 1. Check if user profile already exists by auth UID
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

    // 2. Check if a user record exists with the exact same email (linking password & Google logins)
    const { data: userByEmail } = await supabaseAdmin
      .from("users")
      .select("id, business_id, role, full_name")
      .ilike("email", userEmail)
      .limit(1)
      .maybeSingle();

    if (userByEmail?.business_id) {
      // Link the current auth user ID to this business
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

