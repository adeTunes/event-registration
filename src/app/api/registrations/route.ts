import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { registrationSchema } from "@/types/registration";

function isAdminAuthenticated(req: NextRequest) {
  const cookie = req.cookies.get("admin_session");
  return cookie && cookie.value === "1";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.errors }, { status: 400 });
    }
    await connectToDatabase();
    const { default: mongoose } = await import("mongoose");
    const Registration = mongoose.models.Registration || mongoose.model("Registration", new mongoose.Schema({
      firstName: String,
      middleName: String,
      lastName: String,
      email: String,
      phoneNumber: String,
      alternatePhoneNumber: String,
      gender: String,
      consentForFollowUp: Boolean,
      registrationDate: { type: Date, default: Date.now },
      ipAddress: String,
    }));
    const ip = req.headers.get("x-forwarded-for") || "";
    const doc = await Registration.create({ ...parsed.data, registrationDate: new Date(), ipAddress: ip });
    return NextResponse.json({ success: true, id: doc._id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Admin only: implement auth check in production
  try {
    await connectToDatabase();
    const { default: mongoose } = await import("mongoose");
    const Registration = mongoose.models.Registration || mongoose.model("Registration");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const search = req.nextUrl.searchParams.get("search") || "";
    const sortBy = req.nextUrl.searchParams.get("sortBy") || "registrationDate";
    const sortOrder = req.nextUrl.searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const query: any = search
      ? { $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ] }
      : {};
    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return NextResponse.json({ total, registrations });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
