"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "@/components/admin/StatCard";
import DataTable from "@/components/admin/DataTable";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

const revenueData = [
  { month: "Jan", value: 9000 },
  { month: "Feb", value: 12000 },
  { month: "Mar", value: 10500 },
  { month: "Apr", value: 16500 },
  { month: "May", value: 14900 },
  { month: "Jun", value: 19200 },
];

const growthData = [
  { month: "Jan", users: 80 },
  { month: "Feb", users: 120 },
  { month: "Mar", users: 160 },
  { month: "Apr", users: 140 },
  { month: "May", users: 190 },
  { month: "Jun", users: 220 },
];

const activityColumns = [
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
];

const activityRows = [
  {
    id: 1,
    title: "Urban Apartment Listing",
    type: "Listing",
    status: (
      <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-medium">
        Published
      </span>
    ),
    date: "2026-02-20",
  },
  {
    id: 2,
    title: "Business Cleaning Service",
    type: "Service",
    status: (
      <span className="rounded-full bg-amber-100 text-amber-700 px-2.5 py-1 text-xs font-medium">
        Pending
      </span>
    ),
    date: "2026-02-21",
  },
  {
    id: 3,
    title: "Community Safety Update",
    type: "Post",
    status: (
      <span className="rounded-full bg-indigo-100 text-indigo-700 px-2.5 py-1 text-xs font-medium">
        Live
      </span>
    ),
    date: "2026-02-22",
  },
  {
    id: 4,
    title: "Premium Plan Purchase",
    type: "Plan",
    status: (
      <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-1 text-xs font-medium">
        Paid
      </span>
    ),
    date: "2026-02-24",
  },
  {
    id: 5,
    title: "Downtown Co-Working Space",
    type: "Listing",
    status: (
      <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-medium">
        Approved
      </span>
    ),
    date: "2026-02-27",
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalServices: 0,
    totalPosts: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setError("");

      try {
        const url = `${API_URL}/admin/dashboard-stats`;
        const res = await fetch(url, {
          cache: "no-store",
          credentials: "include",
        });

        const payload = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(payload?.message || "Failed to load dashboard stats");
        }

        if (!cancelled) {
          setStats({
            totalUsers: payload?.data?.totalUsers ?? 0,
            totalListings: payload?.data?.totalListings ?? 0,
            totalServices: payload?.data?.totalServices ?? 0,
            totalPosts: payload?.data?.totalPosts ?? 0,
            totalOrders: payload?.data?.totalOrders ?? 0,
            revenue: payload?.data?.revenue ?? 0,
          });
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message || "Unable to fetch stats");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Total Users",
        value: stats.totalUsers,
        colorClass: "bg-blue-500",
      },
      {
        label: "Total Listings",
        value: stats.totalListings,
        colorClass: "bg-green-500",
      },
      {
        label: "Total Services",
        value: stats.totalServices,
        colorClass: "bg-teal-500",
      },
      {
        label: "Total Posts",
        value: stats.totalPosts,
        colorClass: "bg-purple-500",
      },
      {
        label: "Total Orders",
        value: stats.totalOrders || 0,
        colorClass: "bg-amber-500",
      },
      {
        label: "Revenue",
        value: `₹${stats.revenue || 0}`,
        colorClass: "bg-indigo-500",
      },
    ],
    [stats]
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={loading ? "..." : card.value}
            colorClass={card.colorClass}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Revenue Line Chart
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Growth Bar Chart
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="users" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">
          Recent Activity
        </h2>
        <DataTable columns={activityColumns} rows={activityRows} />
      </div>
    </section>
  );
}
