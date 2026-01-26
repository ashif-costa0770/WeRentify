import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
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
              {[
                "Help Center",
                "Safety Center",
                "Community Guidelines",
                "Contact Us",
                "Report a Problem",
              ].map((item) => (
                <li key={item}>
                  <a className="hover:text-[#5B4FE9] transition-colors cursor-pointer">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">
              Hosting
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {[
                "List Your Item",
                "Responsible Hosting",
                "Host Protection",
                "Insurance & Liability",
              ].map((item) => (
                <li key={item}>
                  <a className="hover:text-[#5B4FE9] transition-colors cursor-pointer">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {[
                "Terms of Service",
                "Privacy Policy",
                "Cookie Policy",
                "Accessibility",
                "Your Privacy Choices",
              ].map((item) => (
                <li key={item}>
                  <a className="hover:text-[#5B4FE9] transition-colors cursor-pointer">
                    {item}
                  </a>
                </li>
              ))}
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
                <Facebook
                  size={18}
                  className="hover:text-[#5B4FE9] cursor-pointer"
                />
                <Twitter
                  size={18}
                  className="hover:text-[#5B4FE9] cursor-pointer"
                />
                <Instagram
                  size={18}
                  className="hover:text-[#5B4FE9] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
