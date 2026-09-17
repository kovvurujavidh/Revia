import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "userId and newPassword required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // userId here is actually the business_id — find the owner's email from users table
    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("business_id", userId)
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();

    if (!userProfile?.id) {
      return NextResponse.json({ error: "No owner found for this business" }, { status: 404 });
    }

    // Use admin API to directly update the auth user's password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userProfile.id, {
      password: newPassword,
    });

    if (error) {
      console.error("Admin password reset error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: data.user.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
