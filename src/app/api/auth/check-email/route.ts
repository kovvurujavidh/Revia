// Importers/Callers: src/app/auth/login/page.tsx, src/app/auth/signup/page.tsx
// Affected API: Next.js API Route Handler `/api/auth/check-email`
// Data Schemas: User, Business from src/lib/types.ts
// User's Verbatim Instruction: "Email login is working now so remove the manual email entry and password entry keep that one also and keep email google login when the google login and email login and need to be connected and when the user just login using the email it need to go to next step of login and create account and when the user uses google login or email login with same email it need to show the same data and do it like this Think and what need to be added and what connections need to be done for better experience and security please add this"

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check in public.users table
    const { data: userRecord } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, business_id, role")
      .ilike("email", cleanEmail)
      .limit(1)
      .maybeSingle();

    if (userRecord) {
      return NextResponse.json({
        exists: true,
        hasBusiness: !!userRecord.business_id,
        name: userRecord.full_name || cleanEmail.split("@")[0],
        role: userRecord.role || "owner",
      });
    }

    // 2. Check in public.businesses table (owner_email)
    const { data: bizRecord } = await supabaseAdmin
      .from("businesses")
      .select("id, name, owner_name, owner_email")
      .ilike("owner_email", cleanEmail)
      .limit(1)
      .maybeSingle();

    if (bizRecord) {
      return NextResponse.json({
        exists: true,
        hasBusiness: true,
        name: bizRecord.owner_name || cleanEmail.split("@")[0],
        role: "owner",
      });
    }

    // 3. Check in Supabase Auth user list (if available via admin)
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const matchedAuthUser = authUsers?.users?.find(
        (u) => u.email?.toLowerCase().trim() === cleanEmail
      );
      if (matchedAuthUser) {
        return NextResponse.json({
          exists: true,
          hasBusiness: false,
          name: matchedAuthUser.user_metadata?.full_name || cleanEmail.split("@")[0],
          role: "owner",
        });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      exists: false,
      hasBusiness: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to check email" }, { status: 500 });
  }
}
