"use client";

export default function PlanCard({ plan, price, features, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`
        cursor-pointer rounded-2xl border p-6 transition-all
        ${selected
          ? "border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50"
          : "border-gray-200 hover:border-gray-400"}
      `}
    >
      <h3 className="text-lg font-bold text-gray-900">{plan}</h3>
      <p className="mt-2 text-3xl font-extrabold text-gray-900">
        ${price}
      </p>
      <p className="text-sm text-gray-500">per month</p>

      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-green-500">✔</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
