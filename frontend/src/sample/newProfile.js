"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, User, Mail, Phone, Save } from 'lucide-react';

export default function AccountProfile() {
  const [profileImage, setProfileImage] = useState(null);

  // Helper to handle image preview

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 ml-1">My Account</h1>
          {/* <p className="text-gray-500 mt-2">Manage your public profile and contact information.</p> */}
        </header>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="py-4 px-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Details</h2>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              
              {/* Avatar Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500 group-hover:bg-indigo-50">
                    {profileImage ? (
                      <Image
                        src={profileImage} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    )}
                  </div>
                  
                  {/* Floating Upload Button */}
                  <label className="absolute bottom-1 right-1 bg-indigo-600 p-2.5 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition-all shadow-lg hover:scale-110 active:scale-95">
                    <Camera size={12} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange} 
                    />
                  </label>
                </div>

                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-gray-700">Profile Photo</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                    Click the camera icon to upload. PNG, JPG or GIF.
                  </p>
                </div>
              </div>

              {/* Input Grid (Name) */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 ml-1">First Name</label>
                  <input 
                    type="text" 
                    placeholder="Jane"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Email (Read Only / Modern Gray) */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    defaultValue="user@email.com"
                    readOnly
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none italic"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Submit Section */}
              <div className=" border-t border-gray-50 mt-2">
                <button 
                  type="submit" 
                  className="flex cursor-pointer items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
                >
                  <Save size={20} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}