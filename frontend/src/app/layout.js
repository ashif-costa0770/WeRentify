import "./globals.css";
import Footer from "@/app/_components/footer/Footer";
import { UserProvider } from "@/context/UserContext";
import { googleTranslateEarlyScript } from "@/lib/googleTranslateEarlyScript";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata = {
  title: "WeRentify",
  description: "Borrow what you need. Lend what you don't.",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({ children }) {
  const facebookAppId =
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "2694434750924820";
  const facebookApiVersion =
    process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || "v22.0";

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script
          id="werentify-gt-chrome-hide"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: googleTranslateEarlyScript }}
        />
        <UserProvider>
          <main>
            {children}
            <Toaster position="top-right" richColors />
          </main>
          <Footer />
        </UserProvider>

        <Script id="facebook-init" strategy="beforeInteractive">
          {`
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: '${facebookAppId}',
        cookie: true,
        xfbml: false,
        version: '${facebookApiVersion}'
      });
      window.fbSdkReady = true;
    };
  `}
        </Script>

        <Script
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
