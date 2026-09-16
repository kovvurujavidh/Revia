import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Use service role to send reset email (bypasses rate limit)
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${new URL(req.url).origin}/auth/login`,
      }
    );

    // If invite fails (user might already exist), try standard reset
    if (error) {
      const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { error: resetError } = await supabaseAnon.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${new URL(req.url).origin}/auth/login`,
        }
      );

      if (resetError) {
        return NextResponse.json({ error: resetError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
