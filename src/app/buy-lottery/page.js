'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LotterySaleForm from '@/components/LotterySaleForm';

export default function BuyLotteryPage() {
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
        กำลังเปิดหน้าฟอร์ม...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mobile-stack pb-8">
      <section className="card p-6 sm:p-8">
        <div className="pill">บันทึกโพย</div>
        <h1 className="section-heading mt-4">เพิ่มเลขและยอดให้เสร็จในหน้าจอเดียว</h1>
        <p className="section-copy mt-3">
          พิมพ์เลขทีละหลายรายการ เพิ่มยอดบน-ล่างหรือโต๊ดได้รวดเร็ว
          ระบบจะเตือนเมื่อเจอเลขอั้นหรือยอดเกินลิมิตก่อนบันทึกจริง
        </p>
      </section>

      <section className="card p-4 sm:p-6">
        <LotterySaleForm />
      </section>
    </div>
  );
}
