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
import StatCard from "@/app/_components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  "",
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

function getStatusBadgeClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "active" || value === "approved" || value === "published" || value === "live") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (value === "pending" || value === "pending_verification") {
    return "bg-amber-100 text-amber-700";
  }
  if (value === "inactive" || value === "suspended") {
    return "bg-slate-100 text-slate-700";
  }
  return "bg-indigo-100 text-indigo-700";
}

function formatActivityDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
}

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
  const [recentActivity, setRecentActivity] = useState([]);

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
          setRecentActivity(
            Array.isArray(payload?.data?.recentActivity) ? payload.data.recentActivity : []
          );
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
    [stats],
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
        <div className="rounded-xl border bg-white shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 py-3">Title</TableHead>
                <TableHead className="px-5 py-3">Type</TableHead>
                <TableHead className="px-5 py-3">User</TableHead>
                <TableHead className="px-5 py-3">Status</TableHead>
                <TableHead className="px-5 py-3">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-sm font-medium text-slate-700">
                      {item.title || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-slate-700">
                      {item.type || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-slate-700">
                      {item.user || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge className={getStatusBadgeClass(item.status)}>
                        {String(item.status || "-")
                          .replaceAll("_", " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-slate-500">
                      {formatActivityDate(item.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-slate-500">
                    No recent activity
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
