import { Prompt } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand",
});

export const metadata = {
  title: "LottoHub | แพลตฟอร์มจัดการโพยหวย",
  description:
    "ระบบบันทึกโพยและจัดการเลขอั้นสำหรับร้านขายหวย ใช้งานง่ายได้ทั้งมือถือและคอมพิวเตอร์",
  keywords: ["หวย", "โพยหวย", "เลขอั้น", "จัดการร้านหวย", "ระบบขายหวย"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} antialiased`}>
        <AuthProvider>
          <NavBar />
          <main className="app-shell">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
