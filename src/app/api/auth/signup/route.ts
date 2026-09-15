import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Try to create user with auto-confirm
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name || "",
      },
    });

    if (error) {
      if (error.message.includes("already exists")) {
        // User exists - sign in with anon client
        const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInError) {
          return NextResponse.json({ error: "Email already registered. Please sign in with your password." }, { status: 409 });
        }

        return NextResponse.json({
          user: signInData.user,
          session: signInData.session,
          existing: true,
        });
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      user: data.user,
      existing: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
