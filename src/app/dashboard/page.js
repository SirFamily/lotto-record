'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const quickActions = [
  {
    href: '/buy-lottery',
    title: 'บันทึกโพยใหม่',
    text: 'กรอกเลขและยอดจากหน้าฟอร์มที่อ่านง่าย รู้ผลก่อนกดยืนยัน.',
  },
  {
    href: '/purchase-history',
    title: 'ดูประวัติโพย',
    text: 'ค้นหาและเปิดดูรายละเอียดโพยย้อนหลังอย่างรวดเร็ว.',
  },
  {
    href: '/system-management',
    title: 'ตั้งค่าเลขและอัตราจ่าย',
    text: 'ปรับเลขอั้น เลขปิด และราคาจ่ายให้สอดคล้องกับรอบปัจจุบัน.',
  },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[--color-text-muted]">
        กำลังโหลดแดชบอร์ด...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mobile-stack">
      <section className="card p-6 sm:p-8">
        <div className="pill">แดชบอร์ด</div>
        <h1 className="section-heading mt-4">สวัสดี {user.username}</h1>
        <p className="section-copy mt-3">
          เลือกเมนูที่ต้องการได้จากด้านล่าง ระบบออกแบบให้ใช้งานง่ายบนมือถือและแสดงเฉพาะข้อมูลสำคัญ
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {quickActions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card rounded-md border border-[--color-border] p-5 transition hover:border-[--color-primary]"
          >
            <p className="text-base font-semibold text-[--color-text]">{item.title}</p>
            <p className="mt-2 text-sm text-[--color-text-muted]">{item.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
