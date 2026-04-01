"use client";
import React, { useEffect, useState } from "react";
import {
  Home,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import { getSettings } from "@/services/admin.service";
import { toast } from "sonner";
import { sendMessage } from "@/services/contact.service";


const ContactPage = () => {
  const [contact, setContact] = useState(null);
  const [social, setSocial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        if (res.data.success) {
          setContact(res.data.data[0].contact);
          setSocial(res.data.data[0].social);
        }
      } catch (error) {
        toast.error(error.response.data.message || "Failed to fetch settings");
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sendMessage(formData);
      if (res.data.success) {
        toast.success(res.data.message || "Message sent successfully");
        setFormData({
          fullName: "",
          email: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response.data.message ||
          error.response.data.errors ||
          "Failed to send message",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const contactInfo = [
    {
      icon: Home,
      title: "Address",
      content:
        contact?.address || "4671 Sugar Camp Road, Owatonna, Minnesota, 55060",
    },
    {
      icon: Phone,
      title: "Phone",
      content: contact?.phone || "561-456-2321",
    },
    {
      icon: Mail,
      title: "Email",
      content: contact?.email || "example@email.com",
    },
  ];

  const socialLinks = [
    {
      key: "facebook",
      icon: Facebook,
      href: social?.facebook || "",
      label: "Facebook",
    },
    {
      key: "instagram",
      icon: Instagram,
      href: social?.instagram || "",
      label: "Instagram",
    },
    {
      key: "twitter",
      icon: Twitter,
      href: social?.twitter || "",
      label: "Twitter",
    },
    {
      key: "linkedin",
      icon: Linkedin,
      href: social?.linkedin || "",
      label: "LinkedIn",
    },
  ].filter((item) => item.href);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-5xl mx-auto py-18 px-6 md:px-10 lg:px-16">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Left Column: Contact Details */}
          <div className="space-y-4">
            <div className="max-w-md ps-2">
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                Let's <span className="text-[#5B4FE9]">Connect.</span>
              </h1>
              <p className="text-[#5B4FE9] text-slate-600 leading-relaxed">
                Have a question or need help? Reach out using the details below
                or send us a quick message.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-7">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-[#5B4FE9]/10 rounded-lg p-2.5 flex items-center justify-center border border-[#5B4FE9]/20">
                    <item.icon
                      className="w-5 h-5 text-[#5B4FE9]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#5B4FE9] mb-1 uppercase tracking-wider">
                      {item.title}
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed max-w-sm">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
              {socialLinks.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-3">Follow us</p>
                  <div className="flex items-center gap-2.5">
                    {socialLinks.map((item) => (
                      <a
                        key={item.key}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#5B4FE9] hover:border-[#5B4FE9] hover:bg-[#5B4FE9]/10 transition-colors flex items-center justify-center"
                      >
                        <item.icon className="h-4.5 w-4.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-5">
              Send Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#5B4FE9] text-slate-900 transition-colors bg-white"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  required
                  placeholder="Enter your email address"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#5B4FE9] text-slate-900 transition-colors bg-white"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  required
                  rows="4"
                  placeholder="Write your message..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#5B4FE9] text-slate-900 transition-colors resize-none bg-white"
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-[#5B4FE9] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#5B4FE9] transition-colors uppercase tracking-wide text-sm mt-1"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
