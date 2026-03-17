import { reverseGeocode, reverseGeocodeGoogle } from "../utils/geocode.js";
import { successResponse, errorResponse } from "../utils/response.js";

//! Get current location from latitude and longitude
export const getCurrentLocation = async (req, res) => {
    try {
      const { lat, lon } = req.query;
  
      if (!lat || !lon) {
        return errorResponse(res, 400, "Latitude and longitude required");
      }
  
      const location = await reverseGeocodeGoogle(lat, lon);
      // const location = await reverseGeocode(lat, lon);
      // console.log(location);
      return successResponse(res, 200, "Location fetched successfully", location);
  
    } catch (error) {
      return errorResponse(res, 500, "Failed to get location", error.message);
    }
  };