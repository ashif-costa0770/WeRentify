export function validateBusinessInfo(data) {
  const errors = {};

  if (!data.businessName?.trim()) {
    errors.businessName = "Business name is required";
  }

  if (!data.category) {
    errors.category = "Please select a category";
  }

  if (!data.hourlyRate || isNaN(data.hourlyRate)) {
    errors.hourlyRate = "Hourly rate must be a number";
  }

  if (Number(data.hourlyRate) <= 0) {
    errors.hourlyRate = "Hourly rate must be greater than 0";
  }

  return errors;
}
