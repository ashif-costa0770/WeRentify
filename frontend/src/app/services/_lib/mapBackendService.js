export function mapBackendService(service = {}) {
  const categoryName = service.category?.name || "other";
  const categoryId = service.category?._id || service.category?.toString?.() || null;
  const iconUrl = service.category?.icon?.url || "other";
  const hourlyRateNum = parseFloat(service.hourlyRate) || 0;
  const providerName =
    `${service.owner?.firstname || ""} ${service.owner?.lastname || ""}`.trim() ||
    service.owner?.firstname ||
    "Provider";

  return {
    ...service,
    id: service._id,
    name: service.businessName || service.serviceType || "Unnamed Service",
    imageUrl:
      service.photos?.[0]?.url ||
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    hourlyRate: service.hourlyRate,
    _hourlyRateNum: hourlyRateNum,
    rating: service.rating ?? 0,
    description: service.description ?? "Professional service with guaranteed quality",
    reviews: service.reviewCount ?? 0,
    verified: Boolean(service.verified),
    provider: providerName,
    categoryName,
    category: categoryId,
    distance: service.serviceRadius ?? 0,
    image: iconUrl,
  };
}
