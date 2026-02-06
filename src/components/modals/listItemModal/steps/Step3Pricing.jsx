"use client";

export default function Step3Pricing({ formData, setFormData }) {

  const calculateWeeklyRate = (daily) => {
    if (!daily || isNaN(daily)) return "";
    return Math.round(daily * 7 * 0.85);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dailyRate') {
      const weekly = calculateWeeklyRate(value);
      setFormData({
        ...formData,
        [name]: value,
        weeklyRate: weekly
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* <div className="bg-blue-50 px-4 py-2 rounded-xl mb-2">
        <p className="text-sm text-blue-800 font-medium">💡 Pricing Tip</p>
        <p className="text-xs text-blue-600 mt-1">
          Competitive pricing helps your item get rented faster. Check similar listings in your area.
        </p>
      </div> */}

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Hourly Rate</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
          <input
            type="number"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            className="w-full text-gray-700 pl-10 pr-16 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">/hour</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Daily Rate <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
          <input
            type="number"
            name="dailyRate"
            value={formData.dailyRate}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            required
            className="w-full pl-10 pr-16 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">/day</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Weekly Rate</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
          <input
            type="text"
            name="weeklyRate"
            value={formData.weeklyRate}
            readOnly
            placeholder={formData.dailyRate ? `Auto-calculated: $${formData.weeklyRate}` : "Auto-calculated from daily rate"}
            className="w-full pl-10 pr-16 py-3  rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">/week</span>
        </div>
        {formData.weeklyRate && (
          <p className="text-xs text-gray-500 mt-1">
            Suggested: ${formData.weeklyRate} (15% weekly discount applied)
          </p>
        )}
      </div>
    </div>
  );
}