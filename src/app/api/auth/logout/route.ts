import { NextResponse } from "next/server";

export async function POST() {
  // Clear the admin session cookie and redirect to /admin/login
  const res = NextResponse.redirect("/admin/login");
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
