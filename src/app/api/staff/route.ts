// Importers/Callers: Called by src/lib/store.ts in addStaffMember and deleteStaffMember methods.
// Affected API: POST and DELETE endpoints at `/api/staff` for secure staff and manager management.
// Data Schemas: StaffMember, User from src/lib/types.ts.
// User's Verbatim Instruction: "owner can able to add or delete staff or manager "

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

    const { name, email, phone, role, business_id, password } = await req.json();

    if (!name || !phone || !role || !business_id) {
      return NextResponse.json(
        { error: "Name, phone, role, and business_id are required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (role !== "staff" && role !== "manager") {
      return NextResponse.json(
        { error: "Role must be 'staff' or 'manager'." },
        { status: 400 }
      );
    }

    const cleanEmail =
      email?.trim().toLowerCase() ||
      `${phone.replace(/[^0-9]/g, "")}@staff.revia.app`;
    const cleanPhone = phone.trim();

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Try to create the auth user with password
    let userId: string;
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: name.trim(),
          role,
          phone: cleanPhone,
          business_id,
        },
      });

    if (authError) {
      // If user already exists in auth, check if they exist in public.users
      if (authError.message?.includes("already been registered")) {
        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Find the auth user by email
          const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
          const found = listUsers?.users?.find((u) => u.email === cleanEmail);
          if (found) {
            userId = found.id;
          } else {
            return NextResponse.json(
              { error: `Auth user creation failed: ${authError.message}` },
              { status: 400 }
            );
          }
        }
      } else {
        return NextResponse.json(
          { error: `Auth user creation failed: ${authError.message}` },
          { status: 400 }
        );
      }
    } else {
      userId = authData.user.id;
    }

    // 2. Insert or upsert into public.users table
    const { data: insertedUser, error: insertError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: userId,
        business_id,
        email: cleanEmail,
        full_name: name.trim(),
        role,
        phone: cleanPhone,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Public users insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to create public user record." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: insertedUser.id,
        business_id: insertedUser.business_id,
        name: insertedUser.full_name,
        email: insertedUser.email,
        phone: cleanPhone,
        role: insertedUser.role,
        status: "active",
        created_at: insertedUser.created_at || new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Staff POST error:", err);
    return NextResponse.json(
      { error: err.message || "Server error while adding staff." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Staff id is required." }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Delete from public.users
    const { error: deleteUserErr } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteUserErr) {
      console.error("Error deleting from public.users:", deleteUserErr);
    }

    // 2. Delete from auth.users (if possible)
    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch (authDelErr) {
      console.warn("Could not delete from auth.users:", authDelErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Staff DELETE error:", err);
    return NextResponse.json(
      { error: err.message || "Server error while deleting staff." },
      { status: 500 }
    );
  }
}
