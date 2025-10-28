'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const publicLinks = [
  { href: '/login', label: 'เข้าสู่ระบบ' },
  { href: '/register', label: 'สมัครใช้งาน' },
];

const privateLinks = [
  { href: '/buy-lottery', label: 'บันทึกโพย' },
  { href: '/purchase-history', label: 'ประวัติโพย' },
  { href: '/system-management', label: 'ตั้งค่าระบบ' },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = useMemo(() => (user ? privateLinks : publicLinks), [user]);

  const handleToggle = () => setMenuOpen((prev) => !prev);
  const handleClose = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-[--color-border] bg-[--color-surface]/80 backdrop-blur-3xl">
      <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="LottoHub Logo" width={40} height={40} className="rounded-full" />
          <span className="hidden sm:inline text-base font-semibold text-[--color-text]">LottoHub</span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-semibold text-[--color-text-muted] md:flex">
          {user && privateLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-4 py-2 transition-colors ${isActive ? 'text-[--color-primary]' : 'hover:text-[--color-text]'}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-[--color-text-muted]">สวัสดี, {user.username}</span>
              <button onClick={handleLogout} className="btn-outline text-xs">
                ออกจากระบบ
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
                <Link href="/login" className="btn-outline">
                    เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="btn-primary">
                    สมัครใช้งาน
                </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[--color-border] md:hidden"
          aria-label="เปิดเมนู"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4.5 6.75h15m-15 5.25h15m-15 5.25h15'} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[--color-border] bg-[--color-surface] md:hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleClose}
                  className={`block rounded-md px-4 py-3 text-sm font-semibold ${isActive ? 'bg-[--color-primary-soft] text-[--color-primary]' : 'text-[--color-text]'}`}>
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-[--color-border] pt-4">
                {user ? (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-[--color-text-muted]">สวัสดี, {user.username}</span>
                        <button onClick={handleLogout} className="btn-outline text-xs">
                            ออกจากระบบ
                        </button>
                    </div>
                ) : (
                    <Link href="/register" onClick={handleClose} className="btn-primary btn-block">
                        สมัครใช้งาน
                    </Link>
                )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}