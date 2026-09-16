import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const origin = new URL(req.url).origin;

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Use service role to send reset email (bypasses rate limit)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
      redirectTo: `${origin}/auth/reset-password`,
    });

    // If invite fails (user might already exist), try standard reset
    if (error) {
      const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
      const { error: resetError } = await supabaseAnon.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${origin}/auth/reset-password`,
      });

      if (resetError) {
        return NextResponse.json({ error: resetError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
