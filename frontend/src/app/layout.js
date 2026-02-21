import "./globals.css";
import Footer from "@/app/components/footer/Footer";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata = {
  title: "WeRentify",
  description: "Borrow what you need. Lend what you don't.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
        appId: '2694434750924820',
        cookie: true,
        xfbml: false,
        version: 'v22.0'
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
