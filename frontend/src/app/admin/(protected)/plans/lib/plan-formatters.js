export function formatCurrency(amount, currency) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "-";

  const code = String(currency || "usd").toUpperCase();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code === "INR" ? "INR" : "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
