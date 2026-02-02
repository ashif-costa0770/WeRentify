"use client";

import Link from "next/link";
import { Package } from "lucide-react";

export default function MyListingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Empty State */}
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You do not have any listings yet
          </h2>

          {/* Button */}
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-3 rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-200"
          >
            Create Your First Listing
          </Link>
        </div>
      </div>
    </div>
  );
}
