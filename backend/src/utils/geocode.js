// utils/geocode.js
import fetch from "node-fetch";

export const geocodeAddress = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?` +
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