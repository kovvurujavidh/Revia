import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const { userId, email, name, industry, phone, currency } = await req.json();

    if (!userId || !email || !name) {
      return NextResponse.json({ error: "userId, email, and name are required" }, { status: 400 });
    }

    // 1. Create business (bypasses RLS via service role)
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .insert({
        name: name.trim(),
        industry,
        owner_name: name.trim(),
        owner_email: email.toLowerCase().trim(),
        phone: phone || "",
        currency: currency || "INR",
        subscription_plan: "growth",
        subscription_status: "trialing",
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: bizError?.message || "Failed to create business" }, { status: 500 });
    }

    // 2. Create user profile linked to business
    const { error: userError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: userId,
        business_id: business.id,
        email: email.toLowerCase().trim(),
        full_name: name.trim(),
        role: "owner",
      });

    if (userError) {
      return NextResponse.json({ error: userError.message || "Failed to create user profile" }, { status: 500 });
    }

    return NextResponse.json({ businessId: business.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
