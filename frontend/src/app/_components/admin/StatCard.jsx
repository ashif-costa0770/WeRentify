export default function StatCard({ label, value, colorClass }) {
  return (
    <div
      className={`rounded-xl shadow-md p-6 text-white transition-transform duration-200 hover:-translate-y-0.5 ${colorClass}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-white/85">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
