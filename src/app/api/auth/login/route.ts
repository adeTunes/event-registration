import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    const { usernameOrEmail, password } = await req.json();
    if (!usernameOrEmail || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }
    // For demo: check against env vars. In production, use DB lookup.
    const isEmail = usernameOrEmail.includes("@");
    const validUser =
      (isEmail && usernameOrEmail === ADMIN_EMAIL) ||
      (!isEmail && usernameOrEmail === ADMIN_EMAIL?.split("@")[0]);
    const validPass = password === ADMIN_PASSWORD;
    if (!validUser || !validPass) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    // Set a simple session cookie (for demo; use JWT/NextAuth in production)
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session", "1", { httpOnly: true, path: "/", maxAge: 60 * 30 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
