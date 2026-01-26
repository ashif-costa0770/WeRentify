'use client';

import { useState } from 'react';

const LANGUAGES = [
  'English','Español','Français','Deutsch','Italiano',
  'Português','Nederlands','Svenska','Dansk','Norsk',
  '中文 (简体)','中文 (繁體)','日本語','한국어','Türkçe',
  'Русский','Polski','Čeština','Magyar','Română'
];

const CURRENCIES = [
  { code: 'USD', name: 'United States dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'CNY', name: 'Chinese yuan' },
  { code: 'CHF', name: 'Swiss franc' },
  { code: 'SEK', name: 'Swedish krona' }
];

export default function LanguageCurrencyModal({ open, onClose }) {
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD');
  const [translate, setTranslate] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white max-w-5xl w-full rounded-3xl shadow-2xl overflow-hidden">

        {/* Header (reduced height) */}
        <div className="relative px-8 py-5 text-center">          

          <h2 className="text-2xl font-bold text-indigo-500">
            Choose a language and currency
          </h2>

          <button
            onClick={onClose}
            className="absolute right-8 min-w-10 text-xl bg-gray-50 rounded-md p-1 cursor-pointer top-5 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Translation Toggle */}
        <div className="px-8">
          <div className="bg-gray-50 rounded-xl px-6 py-3 flex justify-between items-center">
            <div className='mx-auto'>
              <p className="font-semibold text-gray-900 text-center">Translation</p>
              <p className="text-sm text-gray-500">
                Automatically translate descriptions and reviews to English
              </p>
            </div>

            <button
              onClick={() => setTranslate(!translate)}
              className={`w-12 h-6 rounded-full relative transition ${
                translate ? 'bg-indigo-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
                  translate ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Scrollable Content (reduced height) */}
        <div className="px-8 max-h-[45vh] overflow-y-auto pb-4">

          {/* Language */}
          <h3 className="text-lg text-black font-bold mb-3">Language</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded-xl px-4 py-3 text-sm transition border ${
                  language === lang
                    ? 'bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] text-white border-transparent font-semibold'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Currency */}
          <h3 className="text-lg text-black font-bold mb-3">Currency</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {CURRENCIES.map(cur => (
              <button
                key={cur.code}
                onClick={() => setCurrency(cur.code)}
                className={`rounded-xl px-5 py-4 text-center border transition ${
                  currency === cur.code
                    ? 'bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] text-white border-transparent'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p className="font-bold">{cur.code}</p>
                <p className={`text-sm ${currency === cur.code ? 'text-white/90' : 'text-gray-500'}`}>
                  {cur.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer (reduced height) */}
        <div className="px-8 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8]"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
