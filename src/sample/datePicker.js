'use client';

import { useState } from 'react';

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getMonthData(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return days;
}

export default function DatePickerModal({ open, onClose }) {
  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  if (!open) return null;

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const months = [
    new Date(year, month),
    new Date(year, month + 1),
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden">

        {/* Tabs */}
        <div className="flex justify-center gap-8 py-4 border-b">
          {['Dates', 'Months', 'Flexible'].map(tab => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-full font-semibold ${
                tab === 'Dates'
                  ? 'border-2 border-gray-900 text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Calendar */}
        <div className="px-10 py-8 grid grid-cols-2 text-black gap-16 max-h-[60vh] overflow-y-auto">
          {months.map((date, index) => {
            const m = date.getMonth();
            const y = date.getFullYear();
            const days = getMonthData(y, m);

            return (
              <div key={`${y}-${m}`}>
                {/* Month Header */}
                <div className="flex items-center justify-around mb-6">
                  {index === 0 && (
                    <button
                      onClick={() =>
                        setBaseDate(new Date(year, month - 1))
                      }
                      className="text-xl cursor-pointer font-bold "
                    >
                      ◀
                    </button>
                  )}
                  <h3 className="text-xl font-bold">
                    {date.toLocaleString('default', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  {index === 1 && (
                    <button
                      onClick={() =>
                        setBaseDate(new Date(year, month + 1))
                      }
                      className="text-xl cursor-pointer font-bold"
                    >
                      ▶
                    </button>
                  )}
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 text-center text-gray-500 text-sm mb-3">
                  {WEEK_DAYS.map((d, i) => (
                    <div key={`${d}-${i}`}>{d}</div>
                  ))}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-7  gap-y-4 text-center text-sm">
                  {days.map((day, i) => {
                    const isSelected =
                      selectedDate &&
                      selectedDate.day === day &&
                      selectedDate.month === m &&
                      selectedDate.year === y;

                    return (
                      <div key={i}>
                        {day ? (
                          <button
                            onClick={() =>
                              setSelectedDate({
                                day,
                                month: m,
                                year: y,
                              })
                            }
                            className={`w-10 h-10 rounded-full flex cursor-pointer items-center justify-center mx-auto transition ${
                              isSelected
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {day}
                          </button>
                        ) : (
                          <div className="w-10 h-10" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-8 py-5 flex justify-between items-center">
          <button
            onClick={() => setSelectedDate(null)}
            className="underline cursor-pointer font-semibold text-gray-600"
          >
            Clear dates
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 rounded-xl font-semibold border-gray-600 text-gray-600 cursor-pointer"
            >
              Close
            </button>
            <button className="px-6 py-2 cursor-pointer rounded-xl text-white font-semibold bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8]">
              Search
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
