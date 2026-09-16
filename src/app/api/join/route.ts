// Importers/Callers: Called by `/join/[businessId]` public customer registration page
// Affected API: GET and POST endpoints at `/api/join` for public self-registration
// Data Schemas: Business, Customer from src/lib/types.ts
// User's Verbatim Instruction: "when i scan this it need to open a sutomer from so the customer can directly register him self into the=is organization"

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// GET: Fetch public business metadata by ID
export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId is required" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: business, error } = await supabaseAdmin
      .from("businesses")
      .select("id, name, industry, phone, currency, currency_symbol, address, qr_loyalty_perk")
      .eq("id", businessId)
      .maybeSingle();

    if (error || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({ business });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// POST: Register customer directly into the business
export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

    const {
      business_id,
      name,
      phone,
      birthday,
      notes,
      favorite_items,
      opt_in_source = "counter_qr",
    } = await req.json();

    if (!business_id || !name || !phone) {
      return NextResponse.json(
        { error: "Business ID, Name, and Phone are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Check if customer already exists in this business
    const { data: existingCust } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("business_id", business_id)
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (existingCust) {
      // Update existing customer details if needed
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("customers")
        .update({
          name: cleanName,
          last_visit_date: new Date().toISOString(),
          notes: notes ? `${existingCust.notes ? existingCust.notes + " | " : ""}${notes}` : existingCust.notes,
        })
        .eq("id", existingCust.id)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ customer: updated, isNew: false });
    }

    // 2. Insert new customer
    const { data: newCustomer, error: insertErr } = await supabaseAdmin
      .from("customers")
      .insert({
        business_id,
        name: cleanName,
        phone: cleanPhone,
        is_anonymous: false,
        segment: "new",
        total_visits: 1,
        total_spend: 0,
        avg_bill: 0,
        avg_visit_interval_days: 0,
        first_visit_date: new Date().toISOString(),
        last_visit_date: new Date().toISOString(),
        notes: notes || "Registered via Counter/Table QR code",
        favorite_items: favorite_items || [],
        opt_in_source: opt_in_source,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ customer: newCustomer, isNew: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
