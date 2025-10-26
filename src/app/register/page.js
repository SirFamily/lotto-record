'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { register, user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(username, password);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[--color-text-muted]">
        กำลังเตรียมระบบสำหรับคุณ...
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="mobile-stack">
      <section className="card p-6 sm:p-8">
        <div className="pill">สมัครสมาชิก</div>
        <h1 className="section-heading mt-4">เริ่มใช้ LottoHub ได้ทันที</h1>
        <p className="section-copy mt-3">
          สร้างบัญชีเพื่อบันทึกโพย จัดการเลขอั้น และดูรายงานได้ฟรี
          ใช้เพียงชื่อผู้ใช้และรหัสผ่านเท่านั้น
        </p>
        <p className="mt-4 text-sm text-[--color-text-muted]">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-[--color-primary]">
            เข้าสู่ระบบ
          </Link>
        </p>
      </section>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 mobile-stack">
        <label htmlFor="username" className="text-sm font-medium text-[--color-text]">
          ชื่อผู้ใช้ (ภาษาอังกฤษหรือเลข)
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="เช่น lotto.master"
          className="rounded-md border border-[--color-border] px-4 py-3 text-sm"
          required
          autoComplete="off"
        />

        <label htmlFor="password" className="text-sm font-medium text-[--color-text]">
          รหัสผ่าน (อย่างน้อย 8 ตัว)
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="ตั้งรหัสผ่าน"
          className="rounded-md border border-[--color-border] px-4 py-3 text-sm"
          required
          minLength={8}
          autoComplete="new-password"
        />

        {error && (
          <div className="toast border-[--color-danger] text-[--color-danger]">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary btn-block">
          สมัครใช้งาน
        </button>
      </form>
    </div>
  );
}
