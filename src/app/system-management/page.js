'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RateManagement from '@/components/RateManagement';
import NumberClosing from '@/components/NumberClosing';
import NumberLimiting from '@/components/NumberLimiting';

export default function SystemManagementPage() {
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
        กำลังโหลดข้อมูลการตั้งค่า...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mobile-stack pb-8">
      <section className="card p-6 sm:p-8">
        <div className="pill">ตั้งค่าระบบ</div>
        <h1 className="section-heading mt-4">ควบคุมเลขและอัตราจ่ายในรอบนี้</h1>
        <p className="section-copy mt-3">
          ใช้หน้าจอนี้ในการปรับอัตราจ่าย ปิดเลข และกำหนดยอดรับสูงสุดก่อนเริ่มขาย
          ทุกการเปลี่ยนแปลงจะถูกปรับใช้ทันที
        </p>
      </section>

      <section className="card p-6 sm:p-8 mobile-stack">
        <h2 className="text-lg font-semibold text-[--color-text]">อัตราจ่าย</h2>
        <p className="section-copy">
          ปรับราคาให้สอดคล้องกับรอบขายปัจจุบัน ข้อมูลมีผลทันทีหลังบันทึก
        </p>
        <RateManagement />
      </section>

      <section className="card p-6 sm:p-8 mobile-stack">
        <h2 className="text-lg font-semibold text-[--color-text]">ปิดรับเลข</h2>
        <p className="section-copy">
          เลือกเลขที่ต้องการหยุดขายชั่วคราว สามารถค้นหาและสลับสถานะได้รวดเร็ว
        </p>
        <NumberClosing />
      </section>

      <section className="card p-6 sm:p-8 mobile-stack">
        <h2 className="text-lg font-semibold text-[--color-text]">จำกัดยอดเลข</h2>
        <p className="section-copy">
          ตั้งยอดรับสูงสุดต่อเลขไว้ล่วงหน้าเพื่อลดความเสี่ยง ระบบจะแจ้งเตือนเมื่อเกินวงเงิน
        </p>
        <NumberLimiting />
      </section>
    </div>
  );
}
