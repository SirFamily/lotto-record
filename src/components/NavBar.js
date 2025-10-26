'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const publicLinks = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/login', label: 'เข้าสู่ระบบ' },
  { href: '/register', label: 'สมัครใช้งาน' },
];

const privateLinks = [
  { href: '/dashboard', label: 'แดชบอร์ด' },
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
    <header className="border-b border-[--color-border] bg-[--color-surface]">
      <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold text-[--color-text]">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[--color-primary-soft] text-[--color-primary]">
            🎯
          </span>
          LottoHub
        </Link>

        <nav className="hidden items-center gap-3 text-sm text-[--color-text-muted] md:flex">
          {links.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 transition ${
                  isActive ? 'bg-[--color-primary-soft] text-[--color-primary]' : 'hover:text-[--color-text]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="text-sm text-[--color-text-muted]">สวัสดี {user.username}</span>
              <button onClick={handleLogout} className="btn-outline">
                ออกจากระบบ
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary">
              เริ่มใช้งาน
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[--color-border] md:hidden"
          aria-label="เปิดเมนู"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4.5 6.75h15m-15 5.25h15m-15 5.25h15'}
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[--color-border] bg-[--color-surface] md:hidden">
          <div className="flex flex-col gap-2 px-4 py-3 text-sm text-[--color-text]">
            {user && (
              <div className="rounded-md bg-[--color-primary-soft] px-3 py-2 text-[--color-primary]">
                {user.username}
              </div>
            )}
            {links.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleClose}
                  className={`rounded-md px-3 py-2 ${
                    isActive ? 'bg-[--color-primary-soft] text-[--color-primary]' : 'text-[--color-text]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user ? (
              <button onClick={handleLogout} className="btn-outline btn-block">
                ออกจากระบบ
              </button>
            ) : (
              <Link href="/login" onClick={handleClose} className="btn-primary btn-block">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
