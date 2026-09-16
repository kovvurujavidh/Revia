// Importers/Callers: src/context/AppContext.tsx, src/app/auth/callback/route.ts, auth lifecycle handlers
// Affected API: POST `/api/auth/sync-profile` for seamless Google OAuth + Email account data linking
// Data Schemas: User, Business from src/lib/types.ts
// User's Verbatim Instruction: "There is a problem I seen When I use my Gmail Google for login I don't get directly logged into Existent account in Website Say that's the normal big company do right if we log in using Google with existing email It should be login into our Website with our data right Fix And push it to Github"

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
    const { userId, email, fullName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "userId and email are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Check if user profile already exists with a business_id
    const { data: existingProfile } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfile?.business_id) {
      return NextResponse.json({
        success: true,
        linked: true,
        business_id: existingProfile.business_id,
        user: existingProfile,
      });
    }

    // 2. Check if a user record exists with the same email (from email/password signup)
    const { data: userByEmail } = await supabaseAdmin
      .from("users")
      .select("*")
      .ilike("email", cleanEmail)
      .not("business_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (userByEmail?.business_id) {
      const updatedData = {
        id: userId,
        business_id: userByEmail.business_id,
        email: cleanEmail,
        full_name: fullName || userByEmail.full_name || cleanEmail.split("@")[0],
        role: userByEmail.role || "owner",
      };

      const { data: upserted, error: upsertErr } = await supabaseAdmin
        .from("users")
        .upsert(updatedData)
        .select()
        .single();

      if (upsertErr) {
        console.error("Error upserting user by email match:", upsertErr);
      }

      return NextResponse.json({
        success: true,
        linked: true,
        business_id: userByEmail.business_id,
        user: upserted || updatedData,
      });
    }

    // 3. Check if a business exists where owner_email matches
    const { data: businessByEmail } = await supabaseAdmin
      .from("businesses")
      .select("*")
      .ilike("owner_email", cleanEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (businessByEmail) {
      const newUserData = {
        id: userId,
        business_id: businessByEmail.id,
        email: cleanEmail,
        full_name: fullName || businessByEmail.owner_name || cleanEmail.split("@")[0],
        role: "owner",
      };

      const { data: upserted, error: upsertErr } = await supabaseAdmin
        .from("users")
        .upsert(newUserData)
        .select()
        .single();

      if (upsertErr) {
        console.error("Error linking user to existing business:", upsertErr);
      }

      return NextResponse.json({
        success: true,
        linked: true,
        business_id: businessByEmail.id,
        user: upserted || newUserData,
      });
    }

    // 4. No existing business found for this email
    return NextResponse.json({
      success: true,
      linked: false,
      business_id: null,
      user: existingProfile || null,
    });
  } catch (error: any) {
    console.error("Sync profile API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync profile" },
      { status: 500 }
    );
  }
}
