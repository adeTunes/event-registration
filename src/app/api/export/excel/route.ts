import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { parse } from "url";
import * as xlsx from "xlsx";

function isAdminAuthenticated(req: NextRequest) {
  const cookie = req.cookies.get("admin_session");
  return cookie && cookie.value === "1";
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // TODO: Add admin authentication check
  try {
    await connectToDatabase();
    const { default: mongoose } = await import("mongoose");
    const Registration = mongoose.models.Registration || mongoose.model("Registration");
    const { query } = parse(req.url!, true);
    const start = query.start ? new Date(query.start as string) : null;
    const end = query.end ? new Date(query.end as string) : null;
    const filter: any = {};
    if (start && end) {
      filter.registrationDate = { $gte: start, $lte: end };
    }
    const registrations = await Registration.find(filter).lean();
    const data = registrations.map((r: any) => ({
      Name: `${r.firstName} ${r.middleName || ""} ${r.lastName}`.trim(),
      Email: r.email,
      Phone: r.phoneNumber,
      Gender: r.gender,
      "Registration Date": new Date(r.registrationDate).toLocaleString(),
    }));
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Registrations");
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="registrations.xlsx"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
