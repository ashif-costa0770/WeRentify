export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `Just now`;
}
