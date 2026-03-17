import fetch from "node-fetch";

// Forward Geocoding  (from address to latitude and longitude)
export const geocodeAddress = async (address) => {
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    new URLSearchParams({
      q: address,
      format: "json",
      limit: 1,
    });

  const res = await fetch(url, {
    headers: {
      "User-Agent": "WeRentify/1.0 (contact: ashifcostatechnolab@gmail.com)",
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon),
    formattedAddress: data[0].display_name,
  };
};

// Reverse Geocoding (from latitude and longitude to address)
export const reverseGeocode = async (latitude, longitude) => {
  const url =
    `https://nominatim.openstreetmap.org/reverse?` +
    new URLSearchParams({
      lat: latitude,
      lon: longitude,
      addressdetails: 1,
      zoom: 18,
      format: "json",
    });

  const res = await fetch(url, {
    headers: {
      "User-Agent": "WeRentify/1.0 (contact: ashifcostatechnolab@gmail.com)",
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  console.log(latitude, longitude);
  

  return {
    location:
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.borough ||
      data?.address?.suburb ||
      data?.address?.county ||
      data?.address?.neighbourhood ||
      data?.address?.municipality ||
      "",
    formattedAddress: data?.display_name || "",
  };
};

export const reverseGeocodeGoogle = async (lat, lng) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAP_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  const result = data.results?.[0];

  if (!result) return null;

  return {
    location: result.address_components.find(c =>
      c.types.includes("sublocality") ||
      c.types.includes("locality")
    )?.long_name || "",
    formattedAddress: result.formatted_address
  };
};
