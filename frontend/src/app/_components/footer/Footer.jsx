"use client";

import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSettings } from "@/services/admin.service";

export default function Footer() {
  const [social, setSocial] = useState(null);
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const fetchSocial = async () => {
      try {
        const res = await getSettings();
        if (res.data.success) {
          setSocial(res.data.data[0].social);
        }
      } catch (error) {
        console.error("Error fetching social:", error);
        toast.error(error.response.data.message || "Failed to fetch social");
      }
    };
    fetchSocial();
  }, []);

  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-4 pt-8 pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {["About Us", "Careers", "Press", "Blog", "Investors"].map(
                (item) => (
                  <li key={item}>
                    <a className="hover:text-[#5B4FE9] transition-colors cursor-pointer">
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link
                  href="#"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Safety Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Report a Problem
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">
              Hosting
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link
                  href="#"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  List Your Item
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Responsible Hosting
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Host Protection
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Insurance & Liability
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Accessibility
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-choices"
                  className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                >
                  Your Privacy Choices
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 py-4">
          {/* Legal text */}
          <div className="space-y-2 font-sans text-xs text-gray-400 leading-relaxed mb-4 pt-2">
            <p>
              <strong>Legal Disclaimer:</strong>WeRentify is a peer-to-peer
              rental marketplace that connects item owners with renters.
              WeRentify does not own, sell, or rent any items listed on the
              platform. Users are solely responsible for the condition,
              legality, safety, and operation of their listed items. All
              transactions are between users. WeRentify is not a party to any
              rental agreement and bears no responsibility for disputes,
              damages, losses, injuries, or violations that may occur.
            </p>

            <p>
              <strong>Limitation of Liability:</strong> TO THE MAXIMUM EXTENT
              PERMITTED BY LAW, WERENTIFY SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY
              LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
              INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES. Users agree to indemnify and hold WeRentify
              harmless from any claims arising from their use of the platform.
            </p>

            <p>
              <strong>Insurance & Protection:</strong> WeRentify offers optional
              protection plans. However, users are encouraged to maintain their
              own insurance coverage. WeRentify&apos;s protection is secondary
              to any personal insurance. Claims are subject to terms,
              conditions, and exclusions. Not all items, damages, or situations
              are covered.
            </p>

            <p>
              <strong>User Verification:</strong> While WeRentify implements
              verification measures, we do not guarantee the identity,
              credentials, or trustworthiness of any user. Users should exercise
              caution and conduct their own due diligence before engaging in any
              transaction.
            </p>

            <p>
              <strong>Prohibited Activities:</strong> Users may not list stolen
              items, illegal items, recalled products, items requiring special
              licenses (unless verified), or items that violate local, state, or
              federal laws. WeRentify reserves the right to remove listings and
              terminate accounts without notice for violations..
            </p>

            <p>
              <strong>Payment Processing:</strong> All payments are processed
              through third-party payment processors. WeRentify does not store
              payment card information. Users are subject to payment processor
              terms and conditions. WeRentify charges service fees as outlined
              in our Terms of Service.
            </p>

            <p>
              <strong>Dispute Resolution:</strong> Any disputes arising from the
              use of WeRentify shall be resolved through binding arbitration in
              accordance with our Terms of Service. Users waive their right to
              participate in class action lawsuits. Arbitration will be
              conducted in Orlando, Florida, USA
            </p>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2026 WeRentify, Inc. All rights reserved.</p>

            <div className="flex items-center gap-4 text-xs">
              {["Terms", "Privacy", "Sitemap", "Do Not Sell My Info"].map(
                (item) => (
                  <a
                    key={item}
                    className="hover:text-[#5B4FE9] transition-colors cursor-pointer"
                  >
                    {item}
                  </a>
                ),
              )}

              <div className="flex items-center gap-3 ml-2">
                {social?.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook
                      size={18}
                      className="hover:text-[#5B4FE9] cursor-pointer"
                    />
                  </a>
                )}

                {social?.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter
                      size={18}
                      className="hover:text-[#5B4FE9] cursor-pointer"
                    />
                  </a>
                )}

                {social?.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram
                      size={18}
                      className="hover:text-[#5B4FE9] cursor-pointer"
                    />
                  </a>
                )}

                {social?.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin
                      size={18}
                      className="hover:text-[#5B4FE9] cursor-pointer"
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
