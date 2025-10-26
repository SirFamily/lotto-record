'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const highlights = [
  {
    title: 'บันทึกโพยได้ครบในหน้าจอเดียว',
    text: 'เพิ่มเลขหลายชุดพร้อมกัน ปรับยอดบน-ล่างหรือโต๊ดได้ทันที ลดขั้นตอนซ้ำซ้อนและผิดพลาด.',
  },
  {
    title: 'กันพลาดก่อนบันทึก',
    text: 'ระบบตรวจสอบเลขอั้น เลขปิด และยอดเกินลิมิตให้ก่อนยืนยัน ช่วยควบคุมความเสี่ยง.',
  },
  {
    title: 'ค้นหาย้อนหลังได้ไว',
    text: 'ดูประวัติโพยย้อนหลังพร้อมข้อมูลรายละเอียด เหมาะสำหรับตรวจสอบรอบบิลและยอดขาย.',
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[--color-text-muted]">
        กำลังตรวจสอบข้อมูลผู้ใช้...
      </div>
    );
  }

  return (
    <div className="mobile-stack">
      <section className="card p-6 sm:p-8">
        <div className="pill">ระบบจัดการโพยสำหรับร้านหวย</div>
        <h1 className="section-heading mt-4">
          จดโพย จัดการเลขอั้น และติดตามยอดขายได้ในที่เดียว
        </h1>
        <p className="section-copy mt-3">
          LottoHub ถูกออกแบบให้ใช้ง่ายบนมือถือและคอมพิวเตอร์ แสดงเฉพาะสิ่งที่จำเป็น
          และช่วยลดข้อผิดพลาดก่อนบันทึกโพยทุกครั้ง
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={user ? '/dashboard' : '/register'} className="btn-primary">
            {user ? 'ไปที่แดชบอร์ด' : 'สมัครใช้งานฟรี'}
          </Link>
          {!user && (
            <Link href="/login" className="btn-outline">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="section-heading text-[1.4rem]">ฟีเจอร์เด่นที่ผู้ใช้ชื่นชอบ</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => (
            <li key={item.title} className="rounded-md border border-[--color-border] p-4">
              <p className="font-semibold text-[--color-text]">{item.title}</p>
              <p className="mt-2 text-sm text-[--color-text-muted]">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
