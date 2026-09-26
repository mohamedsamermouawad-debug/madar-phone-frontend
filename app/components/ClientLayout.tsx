"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";

export default function ClientLayout({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isFileView = pathname.startsWith("/file-view");
  const isVerify = pathname.startsWith("/checkout/verify");
  const hideChrome = isAdmin || isFileView || isVerify;

  return (
    <>
      {!hideChrome && <Navbar />}
      {!hideChrome && (
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: "13px",
              fontWeight: "700",
              padding: "12px 18px",
              borderRadius: "12px",
              direction: "rtl",
            },
            success: {
              style: { background: "#e6f7f0", color: "#0a5c3a", border: "1px solid #b2dfc9" },
              iconTheme: { primary: "#1a9b6a", secondary: "#fff" },
            },
          }}
        />
      )}
      {children}
      {!hideChrome && footer}
      {!hideChrome && <WhatsappButton />}
    </>
  );
}

