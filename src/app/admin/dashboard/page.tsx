import AdminDashboardPage from "@/components/AdminDahboard";
import React from "react";
import { cookies } from "next/headers";


async function Dashboard() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";
  return <AdminDashboardPage isAdmin={isAdmin} />;
}

export default Dashboard;
