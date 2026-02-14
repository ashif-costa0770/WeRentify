const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

const handleResponse = async (res) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || "API request failed");
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
};

// Normalize listing object from backend to consistent frontend shape
const normalizeListing = (l) => {
  if (!l) return l;
  return {
    _id: l._id || l.id,
    id: l._id || l.id,
    itemName: l.itemName || l.name || "",
    description: l.description || l.descriptionHtml || "",
    descriptionHtml: l.descriptionHtml || l.description || "",
    category: l.category || "",
    photos: Array.isArray(l.photos) ? l.photos : [],
    videos: Array.isArray(l.videos) ? l.videos : [],
    hourlyRate: Number(l.hourlyRate ?? 0),
    dailyRate: Number(l.dailyRate ?? 0),
    weeklyRate: Number(l.weeklyRate ?? 0),
    isAvailable: l.isAvailable ?? true,
    availability: l.isAvailable ?? true,
    offerDelivery: l.offerDelivery ?? false,
    deliveryFee: Number(l.deliveryFee ?? 0),
    pickupLocation: l.pickupLocation || l.generalLocation || "",
    
    // New Fields
    features: Array.isArray(l.features) ? l.features : [],
    rentalRules: Array.isArray(l.rentalRules) ? l.rentalRules : [],
    coordinates: l.coordinates || null,

    // Map schema fields
    rating: Number(l.rating ?? 0),
    reviewCount: Number(l.reviewCount ?? 0),
    views: Number(l.views ?? 0),
    bookings: Number(l.bookings ?? 0),
    status: l.status || "active",
    owner: l.owner || null, 
    // For UI compatibility with static data structure
    distance: 0,
    verified: true,
    reviews: l.reviewCount ?? 0,
    totalRentals: l.bookings ?? 0,
    responseTime: "2 hours",
    raw: l,
  };
};

export const getListings = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const url = `${API_URL}/listings${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  const json = await handleResponse(res);
  if (json && Array.isArray(json.data)) {
    json.data = json.data.map(normalizeListing);
  }
  return json;
};

export const createListing = async (fields = {}, files = {}) => {
  // fields: { itemName, category, description, pickupLocation, dailyRate, features: [], ... }
  // files: { photos: [File], videos: [File] }
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (Array.isArray(value)) {
      // Append array items individually so backend receives them as an array
      value.forEach(item => formData.append(key, String(item)));
    } else {
      formData.append(key, String(value));
    }
  });

  if (files.photos && Array.isArray(files.photos)) {
    files.photos.forEach((file) => formData.append("photos", file));
  }
  if (files.videos && Array.isArray(files.videos)) {
    files.videos.forEach((file) => formData.append("videos", file));
  }

  const res = await fetch(`${API_URL}/listings`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const json = await handleResponse(res);
  if (json && json.data) json.data = normalizeListing(json.data);
  return json;
};

export const updateListing = async (id, fields = {}, files = {}) => {
  const formData = new FormData();
  
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (Array.isArray(value)) {
      value.forEach(item => formData.append(key, String(item)));
    } else {
      formData.append(key, String(value));
    }
  });

  if (files.photos && Array.isArray(files.photos)) {
    files.photos.forEach((file) => formData.append("photos", file));
  }
  if (files.videos && Array.isArray(files.videos)) {
    files.videos.forEach((file) => formData.append("videos", file));
  }

  const res = await fetch(`${API_URL}/listings/${id}`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });
  const json = await handleResponse(res);
  if (json && json.data) json.data = normalizeListing(json.data);
  return json;
};

export const deleteListing = async (id) => {
  const res = await fetch(`${API_URL}/listings/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await handleResponse(res);
  return json;
};

export default {
  getListings,
  createListing,
  updateListing,
  deleteListing,
};
