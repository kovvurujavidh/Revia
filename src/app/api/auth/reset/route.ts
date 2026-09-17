import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const origin = new URL(req.url).origin;

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // First check if user exists in auth
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = authUsers?.users?.some(
      (u) => u.email?.toLowerCase().trim() === cleanEmail
    );

    if (!userExists) {
      // Don't reveal whether user exists - return success anyway (security best practice)
      // But log for debugging
      console.log(`Password reset requested for non-existent user: ${cleanEmail}`);
      return NextResponse.json({ success: true });
    }

    // Use the anon client for password reset (sends the actual reset email)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Reset password error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
