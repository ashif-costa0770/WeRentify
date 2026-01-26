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
  const [activeTab, setActiveTab] = useState('Dates');
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
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                activeTab === tab
                  ? 'border-2 border-black text-black'
                  : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT AREA (FIXED HEIGHT) */}
        <div className="px-10 py-8 max-h-[60vh]">

          {/* DATES TAB */}
          {activeTab === 'Dates' && (
            <div className="grid grid-cols-2 gap-16">
              {months.map((date, index) => {
                const m = date.getMonth();
                const y = date.getFullYear();
                const days = getMonthData(y, m);

                return (
                  <div key={`${y}-${m}`}>
                    {/* Month Header */}
                    <div className="flex items-center justify-between mb-6">
                      {index === 0 ? (
                        <button
                          onClick={() => setBaseDate(new Date(year, month - 1))}
                          className="text-xl font-bold text-black"
                        >
                          ◀
                        </button>
                      ) : <span />}

                      <h3 className="text-xl font-bold text-black">
                        {date.toLocaleString('default', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h3>

                      {index === 1 ? (
                        <button
                          onClick={() => setBaseDate(new Date(year, month + 1))}
                          className="text-xl font-bold text-black"
                        >
                          ▶
                        </button>
                      ) : <span />}
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 text-center text-gray-500 text-sm mb-3">
                      {WEEK_DAYS.map((d, i) => (
                        <div key={`${d}-${i}`}>{d}</div>
                      ))}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-7 gap-y-4 text-center text-sm text-gray-900">
                      {days.map((day, i) => (
                        <div key={i}>
                          {day ? (
                            <button
                              onClick={() =>
                                setSelectedDate({ day, month: m, year: y })
                              }
                              className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center transition
                                ${
                                  selectedDate &&
                                  selectedDate.day === day &&
                                  selectedDate.month === m &&
                                  selectedDate.year === y
                                    ? 'bg-black text-white'
                                    : 'hover:bg-gray-100'
                                }
                              `}
                            >
                              {day}
                            </button>
                          ) : (
                            <div className="w-10 h-10" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MONTHS TAB */}
          {activeTab === 'Months' && (
            <div className="grid grid-cols-4 gap-6">
              {[
                'January','February','March','April',
                'May','June','July','August',
                'September','October','November','December',
              ].map(month => (
                <div
                  key={month}
                  className="border-2 border-gray-300 rounded-2xl py-6 text-center font-semibold text-black hover:bg-gray-50 cursor-pointer"
                >
                  {month}
                </div>
              ))}
            </div>
          )}

          {/* FLEXIBLE TAB */}
          {activeTab === 'Flexible' && (
            <div className="grid grid-cols-2 gap-6">
              {[
                ['Weekend (Fri–Sun)', '3 days'],
                ['Week (Mon–Fri)', '5 days'],
                ['1 Week', '7 days'],
                ['2 Weeks', '14 days'],
                ['1 Month', '30 days'],
                ['± 1 day flexibility', 'Flexible'],
              ].map(([title, sub]) => (
                <div
                  key={title}
                  className="border-2 border-gray-300 rounded-2xl p-6 hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-bold text-black">{title}</p>
                  <p className="text-gray-500">{sub}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t px-8 py-5 flex justify-between items-center">
          <button
            onClick={() => setSelectedDate(null)}
            className="underline font-semibold text-gray-600"
          >
            Clear dates
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 rounded-xl font-semibold border-gray-600 text-gray-600"
            >
              Close
            </button>
            <button className="px-6 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8]">
              Search
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
