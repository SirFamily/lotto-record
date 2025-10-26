'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[--color-text-muted]">
        กำลังตรวจสอบสถานะบัญชี...
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="mobile-stack">
      <section className="card p-6 sm:p-8">
        <div className="pill">เข้าสู่ระบบ</div>
        <h1 className="section-heading mt-4">จัดการโพยของคุณได้ทันที</h1>
        <p className="section-copy mt-3">
          กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่แดชบอร์ด
          หากยังไม่มีบัญชีสามารถสมัครใช้งานได้ฟรีภายในไม่กี่ขั้นตอน
        </p>
        <p className="mt-4 text-sm text-[--color-text-muted]">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-[--color-primary]">
            สมัครสมาชิก
          </Link>
        </p>
      </section>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 mobile-stack">
        <label htmlFor="username" className="text-sm font-medium text-[--color-text]">
          ชื่อผู้ใช้
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="เช่น agent88"
          className="rounded-md border border-[--color-border] px-4 py-3 text-sm"
          required
          autoComplete="username"
        />

        <label htmlFor="password" className="text-sm font-medium text-[--color-text]">
          รหัสผ่าน
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="รหัสผ่าน"
          className="rounded-md border border-[--color-border] px-4 py-3 text-sm"
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="toast border-[--color-danger] text-[--color-danger]">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary btn-block">
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}
