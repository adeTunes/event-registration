"use client";

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface Registration {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  registrationDate: string;
}

export default function AdminDashboardPage({ isAdmin }: { isAdmin?: boolean }) {
  if (!isAdmin) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    } else {
      redirect("/admin/login");
    }
  }

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [recent, setRecent] = useState(0);
  const [genderStats, setGenderStats] = useState<{
    male: number;
    female: number;
    other: number;
  }>({ male: 0, female: 0, other: 0 });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/api/registrations?limit=20");
      const data = await res.json();
      setRegistrations(data.registrations || []);
      setTotal(data.total || 0);
      // Calculate stats
      const now = new Date();
      const last24h = data.registrations.filter(
        (r: any) =>
          new Date(r.registrationDate) >
          new Date(now.getTime() - 24 * 60 * 60 * 1000)
      );
      setRecent(last24h.length);
      const genderCount = { male: 0, female: 0, other: 0 };
      data.registrations.forEach((r: any) => {
        if (r.gender === "male") genderCount.male++;
        else if (r.gender === "female") genderCount.female++;
        else if (r.gender === "other") genderCount.other++;
      });
      setGenderStats(genderCount);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleExport = async () => {
    let url = "/api/export/excel";
    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    }
    window.location.href = url;
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-yellow-50 to-white p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-8 mt-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-yellow-700">
            Admin Dashboard
          </h1>
          <form method="POST" action="/api/auth/logout">
            <button
              type="submit"
              className="btn hover:underline cursor-pointer btn-secondary"
            >
              Logout
            </button>
          </form>
        </header>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-100 rounded p-4 text-center">
            <div className="text-3xl font-bold">{loading ? "--" : total}</div>
            <div>Total Registrations</div>
          </div>
          <div className="bg-yellow-100 rounded p-4 text-center">
            <div className="text-3xl font-bold">{loading ? "--" : recent}</div>
            <div>Last 24h</div>
          </div>
          <div className="bg-yellow-100 rounded p-4 text-center">
            <div className="text-3xl font-bold">
              {loading
                ? "--"
                : `${genderStats.male}M / ${genderStats.female}F / ${genderStats.other}O`}
            </div>
            <div>Gender Distribution</div>
          </div>
        </div>
        {/* Export Section */}
        {/* <div className="mt-8 flex flex-col md:flex-row items-center gap-4"> */}
        <div className="w-full flex justify-end">
          <Button className="mb-3" onClick={handleExport}>
            Download Excel
          </Button>
        </div>
        {/* <div className="flex flex-col md:flex-row gap-2">
            <label className="sr-only" htmlFor="start-date">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              className="input input-bordered"
              placeholder="Start date"
              title="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label className="sr-only" htmlFor="end-date">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              className="input input-bordered"
              placeholder="End date"
              title="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div> */}
        {/* </div> */}
        {/* Registrations Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border">
            <thead>
              <tr className="bg-yellow-200">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Gender</th>
                <th className="px-4 py-2">Registration Date</th>
                {/* <th className="px-4 py-2">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No data yet
                  </td>
                </tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r._id} className="border-b">
                    <td className="px-4 py-2">{`${r.firstName} ${
                      r.middleName ? r.middleName + " " : ""
                    }${r.lastName}`}</td>
                    <td className="px-4 py-2">{r.email}</td>
                    <td className="px-4 py-2">{r.phoneNumber}</td>
                    <td className="px-4 py-2 capitalize">{r.gender}</td>
                    <td className="px-4 py-2">
                      {new Date(r.registrationDate).toLocaleString()}
                    </td>
                    {/* <td className="px-4 py-2">-</td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
