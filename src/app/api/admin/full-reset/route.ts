import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Delete ALL auth users
    const { data: authUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json(
        { error: "Failed to list auth users: " + listError.message },
        { status: 500 }
      );
    }

    let deletedAuthCount = 0;
    if (authUsers?.users) {
      for (const user of authUsers.users) {
        const { error: deleteError } =
          await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (!deleteError) {
          deletedAuthCount++;
        }
      }
    }

    // 2. Truncate all database tables (in order for foreign keys)
    const tables = [
      "whatsapp_logs",
      "whatsapp_templates",
      "visits",
      "customers",
      "users",
      "businesses",
    ];

    for (const table of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows

      if (error) {
        console.error(`Error clearing ${table}:`, error.message);
      }
    }

    return NextResponse.json({
      success: true,
      deletedAuthUsers: deletedAuthCount,
      message: `Deleted ${deletedAuthCount} auth users and cleared all database tables.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error during full reset" },
      { status: 500 }
    );
  }
}
